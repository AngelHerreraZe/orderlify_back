'use strict';
const { Op } = require('sequelize');
const db = require('../database/models/index');
const dayjs = require('dayjs');
const https = require('https');
const http = require('http');

const DOW = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const tenantWhere = (tenant = {}) => {
  const where = {};
  if (tenant.companyId) where.companyId = tenant.companyId;
  if (tenant.branchId) where.branchId = tenant.branchId;
  return where;
};

const calcGrowth = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const queryRevenue = (start, end, tenant) =>
  db.Orders.findAll({
    where: {
      ...tenantWhere(tenant),
      createdAt: { [Op.between]: [start, end] },
      status: { [Op.ne]: 'Cancelado' },
    },
    attributes: ['total'],
  }).then((rows) => rows.reduce((sum, o) => sum + (o.total || 0), 0));

const fetchImageAsBase64 = (url) =>
  new Promise((resolve) => {
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return resolve(null);
    }
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          const ct = res.headers['content-type'] || 'image/png';
          resolve(`data:${ct};base64,${buf.toString('base64')}`);
        });
        res.on('error', () => resolve(null));
      })
      .on('error', () => resolve(null));
  });

class ReportService {
  static async generatePdfData(startDate, endDate, tenant = {}) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    // Comparison dates (calendar-based, always relative to today)
    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();
    const yesterdayStart = dayjs().subtract(1, 'day').startOf('day').toDate();
    const yesterdayEnd = dayjs().subtract(1, 'day').endOf('day').toDate();
    const thisWeekStart = dayjs().startOf('week').toDate();
    const thisWeekEnd = dayjs().endOf('week').toDate();
    const lastWeekStart = dayjs().subtract(1, 'week').startOf('week').toDate();
    const lastWeekEnd = dayjs().subtract(1, 'week').endOf('week').toDate();
    const thisMonthStart = dayjs().startOf('month').toDate();
    const thisMonthEnd = dayjs().endOf('month').toDate();
    const lastMonthStart = dayjs().subtract(1, 'month').startOf('month').toDate();
    const lastMonthEnd = dayjs().subtract(1, 'month').endOf('month').toDate();

    const [
      orders,
      company,
      branch,
      todayRev,
      yesterdayRev,
      thisWeekRev,
      lastWeekRev,
      thisMonthRev,
      lastMonthRev,
    ] = await Promise.all([
      db.Orders.findAll({
        where: {
          ...tenantWhere(tenant),
          createdAt: { [Op.between]: [start, end] },
          status: { [Op.ne]: 'Cancelado' },
        },
        include: [
          {
            model: db.OrdersItems,
            include: [{ model: db.Products, include: [{ model: db.Categories }] }],
          },
          { model: db.User, as: 'user', attributes: ['id', 'name'] },
        ],
      }),
      tenant.companyId ? db.Company.findByPk(tenant.companyId) : null,
      tenant.branchId ? db.Branch.findByPk(tenant.branchId, { attributes: ['name'] }) : null,
      queryRevenue(todayStart, todayEnd, tenant),
      queryRevenue(yesterdayStart, yesterdayEnd, tenant),
      queryRevenue(thisWeekStart, thisWeekEnd, tenant),
      queryRevenue(lastWeekStart, lastWeekEnd, tenant),
      queryRevenue(thisMonthStart, thisMonthEnd, tenant),
      queryRevenue(lastMonthStart, lastMonthEnd, tenant),
    ]);

    // ── Aggregations ──────────────────────────────────────────────────────────
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const ordersCount = orders.length;
    const avgTicket = ordersCount > 0 ? totalRevenue / ordersCount : 0;

    const dayMap = {};
    const productMap = {};
    const categoryMap = {};
    const waiterMap = {};
    const serviceMap = {};
    const hourMap = {};
    const dowMap = {};

    orders.forEach((order) => {
      const date = dayjs(order.createdAt);
      const dateStr = date.format('YYYY-MM-DD');
      const hour = date.hour();
      const dow = date.day();
      const waiter = order.user?.name || 'Desconocido';
      const serviceType = order.serviceType || 'mesa';
      const orderTotal = order.total || 0;

      // By day
      if (!dayMap[dateStr]) dayMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
      dayMap[dateStr].revenue += orderTotal;
      dayMap[dateStr].orders++;

      // By waiter
      if (!waiterMap[waiter]) waiterMap[waiter] = { waiter, revenue: 0, orders: 0 };
      waiterMap[waiter].revenue += orderTotal;
      waiterMap[waiter].orders++;

      // By service type
      if (!serviceMap[serviceType]) serviceMap[serviceType] = { type: serviceType, revenue: 0, orders: 0 };
      serviceMap[serviceType].revenue += orderTotal;
      serviceMap[serviceType].orders++;

      // By hour
      if (!hourMap[hour]) hourMap[hour] = { hour, revenue: 0, orders: 0 };
      hourMap[hour].revenue += orderTotal;
      hourMap[hour].orders++;

      // By day of week
      if (!dowMap[dow]) dowMap[dow] = { dayIndex: dow, day: DOW[dow], revenue: 0, orders: 0 };
      dowMap[dow].revenue += orderTotal;
      dowMap[dow].orders++;

      // By product / category
      order.OrdersItems.forEach((item) => {
        const productName = item.Product?.name || 'Desconocido';
        const categoryName = item.Product?.Category?.name || 'Sin categoría';
        const itemRevenue = (item.price || 0) * (item.quantity || 0);

        if (!productMap[productName]) {
          productMap[productName] = { name: productName, quantity: 0, revenue: 0, category: categoryName };
        }
        productMap[productName].quantity += item.quantity || 0;
        productMap[productName].revenue += itemRevenue;

        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = { category: categoryName, revenue: 0, quantity: 0 };
        }
        categoryMap[categoryName].revenue += itemRevenue;
        categoryMap[categoryName].quantity += item.quantity || 0;
      });
    });

    // ── Sorted results ────────────────────────────────────────────────────────
    const salesByDay = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

    const allProducts = Object.values(productMap).sort((a, b) => b.quantity - a.quantity);
    const top10Products = allProducts.slice(0, 10);
    const top10ByRevenue = [...allProducts].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    const salesByCategory = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);

    const salesByWaiter = Object.values(waiterMap)
      .sort((a, b) => b.revenue - a.revenue)
      .map((w) => ({ ...w, avgTicket: w.orders > 0 ? w.revenue / w.orders : 0 }));

    const salesByServiceType = Object.values(serviceMap).sort((a, b) => b.revenue - a.revenue);

    const salesByHour = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      revenue: hourMap[i]?.revenue || 0,
      orders: hourMap[i]?.orders || 0,
    }));

    const salesByDayOfWeek = Array.from({ length: 7 }, (_, i) => ({
      dayIndex: i,
      day: DOW[i],
      revenue: dowMap[i]?.revenue || 0,
      orders: dowMap[i]?.orders || 0,
    }));

    // ── Growth ────────────────────────────────────────────────────────────────
    const dayGrowth = calcGrowth(todayRev, yesterdayRev);
    const weekGrowth = calcGrowth(thisWeekRev, lastWeekRev);
    const monthGrowth = calcGrowth(thisMonthRev, lastMonthRev);

    // ── Insights ──────────────────────────────────────────────────────────────
    const peakHour = salesByHour.reduce(
      (max, h) => (h.orders > max.orders ? h : max),
      { hour: 0, orders: 0, revenue: 0 }
    );
    const topProduct = top10Products[0];
    const topWaiter = salesByWaiter[0];
    const topServiceType = salesByServiceType[0];
    const topCategory = salesByCategory[0];
    const topDayOfWeek = salesByDayOfWeek.reduce(
      (max, d) => (d.revenue > max.revenue ? d : max),
      { day: '', revenue: 0 }
    );

    const insights = [];
    if (topProduct)
      insights.push(`El producto más vendido fue "${topProduct.name}" con ${topProduct.quantity} unidades vendidas.`);
    if (peakHour.orders > 0)
      insights.push(`La hora pico es a las ${String(peakHour.hour).padStart(2, '0')}:00 con ${peakHour.orders} órdenes.`);
    if (topWaiter)
      insights.push(`El mesero con más ventas fue ${topWaiter.waiter} con $${topWaiter.revenue.toFixed(2)} en ingresos.`);
    if (topServiceType)
      insights.push(`El tipo de servicio más usado fue "${topServiceType.type}" con ${topServiceType.orders} órdenes.`);
    if (topCategory)
      insights.push(`La categoría más rentable fue "${topCategory.category}".`);
    if (topDayOfWeek.revenue > 0)
      insights.push(`El día con más ventas fue ${topDayOfWeek.day}.`);
    if (Math.abs(monthGrowth) > 0)
      insights.push(
        `Las ventas ${monthGrowth >= 0 ? 'crecieron' : 'cayeron'} un ${Math.abs(monthGrowth)}% este mes respecto al mes anterior.`
      );
    if (Math.abs(weekGrowth) > 0)
      insights.push(
        `Esta semana las ventas ${weekGrowth >= 0 ? 'crecieron' : 'cayeron'} un ${Math.abs(weekGrowth)}% vs la semana pasada.`
      );

    // ── Logo (convert to base64 for self-contained HTML) ─────────────────────
    const logoBase64 = company?.logoUrl ? await fetchImageAsBase64(company.logoUrl) : null;

    return {
      company: {
        name: company?.name || 'Restaurante',
        logoUrl: company?.logoUrl || null,
        logoBase64,
        branch: branch?.name || '',
      },
      startDate,
      endDate,
      kpis: { totalRevenue, ordersCount, avgTicket },
      comparisons: {
        today: { current: todayRev, previous: yesterdayRev, growth: dayGrowth },
        week: { current: thisWeekRev, previous: lastWeekRev, growth: weekGrowth },
        month: { current: thisMonthRev, previous: lastMonthRev, growth: monthGrowth },
      },
      salesByDay,
      top10Products,
      top10ByRevenue,
      salesByCategory,
      salesByWaiter,
      salesByServiceType,
      salesByHour,
      salesByDayOfWeek,
      insights,
    };
  }
}

module.exports = ReportService;
