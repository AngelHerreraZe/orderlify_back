const db = require('../database/models/index');
const { fn, col, Op, Sequelize } = require('sequelize');

const getLocalDate = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const buildStats = (totalSales) => {
  const productStats = {};
  const waiterStats = {};

  totalSales.forEach((order) => {
    order.OrdersItems.forEach((item) => {
      const name = item.Product.name;
      if (!productStats[name]) productStats[name] = { count: 0, totalQuantity: 0 };
      productStats[name].count += 1;
      productStats[name].totalQuantity += item.quantity;
    });
    const waiterName = order.User?.name || 'Desconocido';
    waiterStats[waiterName] = (waiterStats[waiterName] || 0) + 1;
  });

  let mostSoldProduct = null;
  let maxQuantity = 0;
  for (const [name, stats] of Object.entries(productStats)) {
    if (stats.totalQuantity > maxQuantity) {
      maxQuantity = stats.totalQuantity;
      mostSoldProduct = { name, ...stats };
    }
  }

  let topWaiter = null;
  let maxOrders = 0;
  for (const [waiter, count] of Object.entries(waiterStats)) {
    if (count > maxOrders) {
      maxOrders = count;
      topWaiter = waiter;
    }
  }

  const totalRevenue = totalSales.reduce((sum, o) => sum + (o.total || 0), 0);
  const averageOrderValue = totalSales.length > 0 ? totalRevenue / totalSales.length : 0;

  return { mostSoldProduct, topWaiter, maxOrders, averageOrderValue };
};

class adminServices {
  static async dailyOverview() {
    const today = getLocalDate();

    const totalSales = await db.Orders.findAll({
      where: Sequelize.where(fn('DATE', col('Orders.createdAt')), today),
      include: [
        { model: db.OrdersItems, include: [{ model: db.Products }] },
        { model: db.User, attributes: { exclude: ['password', 'active', 'createdAt', 'updatedAt'] } },
      ],
    });

    const { mostSoldProduct, topWaiter, maxOrders, averageOrderValue } = buildStats(totalSales);

    // Reutilizar totalSales en lugar de segunda query
    const pendingOrders = totalSales.filter(
      (o) => o.status === 'Pendiente' || o.status === 'Preparando'
    );

    const activeTables = await db.Tables.count();

    return {
      date: today,
      dailySales: totalSales.length,
      mostSoldProduct,
      pendingOrders: pendingOrders.length,
      activeTables,
      averageOrderValue,
      topWaiter: { topWaiter, maxOrders },
    };
  }

  static async getWeeklyOverView() {
    const startDate = getLocalDate();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const endDate = getLocalDate(sevenDaysAgo);

    const totalSales = await db.Orders.findAll({
      where: { createdAt: { [Op.between]: [endDate, startDate] } },
      include: [
        { model: db.OrdersItems, include: [{ model: db.Products }] },
        { model: db.User, attributes: { exclude: ['password', 'active', 'createdAt', 'updatedAt'] } },
      ],
    });

    const { mostSoldProduct, topWaiter, maxOrders, averageOrderValue } = buildStats(totalSales);

    const pendingOrders = totalSales.filter(
      (o) => o.status === 'Pendiente' || o.status === 'Preparando'
    );

    const activeTables = await db.Tables.count();

    return {
      startDate,
      endDate,
      weeklySales: totalSales.length,
      mostSoldProduct,
      pendingOrders: pendingOrders.length,
      activeTables,
      averageOrderValue,
      topWaiter: { topWaiter, maxOrders },
    };
  }

  static async getReports(startDate, endDate) {
    const totalSales = await db.Orders.findAll({
      where: { createdAt: { [Op.between]: [startDate, endDate] } },
      include: [
        {
          model: db.OrdersItems,
          include: [{ model: db.Products, include: [{ model: db.Categories }] }],
        },
        { model: db.User, attributes: { exclude: ['password', 'active', 'createdAt', 'updatedAt'] } },
      ],
    });

    const totalRevenue = totalSales.reduce((sum, o) => sum + (o.total || 0), 0);
    const productByCategory = {};
    const waiterStats = {};

    totalSales.forEach((order) => {
      const waiterName = order.User?.name || 'Desconocido';
      waiterStats[waiterName] = (waiterStats[waiterName] || 0) + 1;

      order.OrdersItems.forEach((item) => {
        const product = item.Product;
        const category = product.Category.name;
        if (!productByCategory[category]) productByCategory[category] = {};
        const current = productByCategory[category][product.name] || 0;
        productByCategory[category][product.name] = current + item.quantity;
      });
    });

    const topWaiters = Object.entries(waiterStats)
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 3);

    return {
      period: { from: startDate, to: endDate },
      sales: { totalRevenue, ordersCount: totalSales.length },
      productByCategory,
      topWaiters,
    };
  }

  static async genExcel(startDate, endDate) {
    const orders = await db.Orders.findAll({
      where: { createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] } },
      include: [
        { model: db.OrdersItems, include: [{ model: db.Products, include: [{ model: db.Categories }] }] },
        { model: db.User, attributes: { exclude: ['password', 'active', 'createdAt', 'updatedAt'] } },
      ],
    });
    return orders;
  }
}

module.exports = adminServices;
