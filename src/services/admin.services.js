const db = require('../database/models/index');
const { where, fn, col, Op, Sequelize } = require('sequelize');
const ExcelJS = require('exceljs');
const path = require('path');

class adminServices {
  static async dailyOvewview() {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const localShortDate = `${year}-${month}-${day}`;
      const totalSales = await db.Orders.findAll({
        where: where(fn('DATE', col('Orders.createdAt')), localShortDate),
        include: [
          {
            model: db.OrdersItems,
            include: [{ model: db.Products }],
          },
          {
            model: db.User,
            attributes: {
              exclude: ['password', 'active', 'createdAt', 'updatedAt'],
            },
          },
        ],
      });
      const productStats = {};
      const waiterStats = {};
      totalSales.forEach((order) => {
        order.OrdersItems.forEach((item) => {
          const name = item.Product.name;
          if (!productStats[name]) {
            productStats[name] = {
              count: 0,
              totalQuantity: 0,
            };
          }
          productStats[name].count += 1;
          productStats[name].totalQuantity += item.quantity;
        });
        const waiterName = order.User?.name || 'Desconocido';
        if (!waiterStats[waiterName]) {
          waiterStats[waiterName] = 0;
        }
        waiterStats[waiterName]++;
      });
      let mostSoldProduct = null;
      let maxQuantity = 0;
      for (const [name, stats] of Object.entries(productStats)) {
        if (stats.totalQuantity > maxQuantity) {
          maxQuantity = stats.totalQuantity;
          mostSoldProduct = {
            name,
            ...stats,
          };
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
      const pendingOrders = await db.Orders.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [{ status: 'Preparando' }, { status: 'Pendiente' }],
            },
            Sequelize.where(
              Sequelize.fn('DATE', Sequelize.col('Orders.createdAt')),
              localShortDate
            ),
          ],
        },
        include: [{ model: db.Tables }],
      });

      const orders = totalSales || [];
      const totalOrders = orders.reduce(
        (sum, order) => sum + (order.total || 0),
        0
      );
      const averageOrderValue =
        orders.length > 0 ? totalOrders / orders.length : 0;

      const activeTables = await db.Tables.findAll();
      const finalResponse = {
        date: localShortDate,
        dailySales: Object.keys(totalSales).length,
        mostSoldProduct,
        pendingOrders: pendingOrders.length,
        activeTables: activeTables.length,
        averageOrderValue,
        topWaiter: {
          topWaiter,
          maxOrders,
        },
      };
      return finalResponse;
    } catch (error) {
      throw error;
    }
  }

  static async getWeeklyOverView() {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const startDate = `${year}-${month}-${day}`;
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const endYear = sevenDaysAgo.getFullYear();
      const endMonth = String(sevenDaysAgo.getMonth() + 1).padStart(2, '0');
      const endDay = String(sevenDaysAgo.getDate()).padStart(2, '0');
      const endDate = `${endYear}-${endMonth}-${endDay}`;

      const totalSales = await db.Orders.findAll({
        where: {
          createdAt: {
            [Op.between]: [endDate, startDate],
          },
        },
        include: [
          {
            model: db.OrdersItems,
            include: [{ model: db.Products }],
          },
          {
            model: db.User,
            attributes: {
              exclude: ['password', 'active', 'createdAt', 'updatedAt'],
            },
          },
        ],
      });
      const productStats = {};
      const waiterStats = {};
      totalSales.forEach((order) => {
        order.OrdersItems.forEach((item) => {
          const name = item.Product.name;
          if (!productStats[name]) {
            productStats[name] = {
              count: 0,
              totalQuantity: 0,
            };
          }
          productStats[name].count += 1;
          productStats[name].totalQuantity += item.quantity;
        });
        const waiterName = order.User?.name || 'Desconocido';
        if (!waiterStats[waiterName]) {
          waiterStats[waiterName] = 0;
        }
        waiterStats[waiterName]++;
      });
      let mostSoldProduct = null;
      let maxQuantity = 0;
      for (const [name, stats] of Object.entries(productStats)) {
        if (stats.totalQuantity > maxQuantity) {
          maxQuantity = stats.totalQuantity;
          mostSoldProduct = {
            name,
            ...stats,
          };
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
      const pendingOrders = await db.Orders.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [{ status: 'Preparando' }, { status: 'Pendiente' }],
            },
            Sequelize.where(
              Sequelize.fn('DATE', Sequelize.col('Orders.createdAt')),
              {
                [Op.between]: [endDate, startDate],
              }
            ),
          ],
        },
        include: [{ model: db.Tables }],
      });

      const orders = totalSales || [];
      const totalOrders = orders.reduce(
        (sum, order) => sum + (order.total || 0),
        0
      );
      const averageOrderValue =
        orders.length > 0 ? totalOrders / orders.length : 0;

      const activeTables = await db.Tables.findAll();
      const finalResponse = {
        startDate: startDate,
        endDate,
        weeklySales: Object.keys(totalSales).length,
        mostSoldProduct,
        pendingOrders: pendingOrders.length,
        activeTables: activeTables.length,
        averageOrderValue,
        topWaiter: {
          topWaiter,
          maxOrders,
        },
      };
      return finalResponse;
    } catch (error) {
      throw error;
    }
  }

  static async getReports(startDate, endDate) {
    try {
      const totalSales = await db.Orders.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: db.OrdersItems,
            include: [
              { model: db.Products, include: [{ model: db.Categories }] },
            ],
          },
          {
            model: db.User,
            attributes: {
              exclude: ['password', 'active', 'createdAt', 'updatedAt'],
            },
          },
        ],
      });

      const orders = totalSales || [];
      const totalOrders = orders.reduce(
        (sum, order) => sum + (order.total || 0),
        0
      );

      const productByCategory = {};
      const waiterStats = {};

      totalSales.forEach((order) => {
        const waiterName = order.User?.name || 'Desconocido';
        if (!waiterStats[waiterName]) {
          waiterStats[waiterName] = 0;
        }
        waiterStats[waiterName]++;

        order.OrdersItems.forEach((item) => {
          const product = item.Product;
          const category = product.Category.name;
          const quantity = item.quantity;

          if (!productByCategory[category]) {
            productByCategory[category] = {};
          }

          const currentBest = productByCategory[category];

          if (
            !currentBest.name ||
            quantity + (currentBest.totalQuantity || 0) >
              (currentBest.totalQuantity || 0)
          ) {
            productByCategory[category] = {
              name: product.name,
              totalQuantity:
                quantity +
                (currentBest.name === product.name
                  ? currentBest.totalQuantity || 0
                  : 0),
            };
          } else if (currentBest.name === product.name) {
            currentBest.totalQuantity += quantity;
          }
        });
      });

      const topWaiters = Object.entries(waiterStats)
        .map(([name, orders]) => ({ name, orders }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 3);

      const finalResponse = {
        period: {
          from: startDate,
          to: endDate,
        },
        sales: {
          totalOrders,
          ordersCount: orders.length,
        },
        productByCategory,
        topWaiters,
      };
      return totalSales;
    } catch (error) {
      throw error;
    }
  }

  static async genExcel(startDate, endDate) {
    try {
      const orders = await db.Orders.findAll({
        where: {
          createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        },
        include: [
          {
            model: db.OrdersItems,
            include: [
              {
                model: db.Products,
                include: [{ model: db.Categories }],
              },
            ],
          },
          {
            model: db.User,
            attributes: {
              exclude: ['password', 'active', 'createdAt', 'updatedAt'],
            },
          },
        ],
      });

      return orders;
    } catch (error) {
      throw new Error('Error al obtener las órdenes: ' + error.message);
    }
  }
}

module.exports = adminServices;
