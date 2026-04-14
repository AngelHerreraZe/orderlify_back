'use strict';
const db = require('../database/models/index');
const { Op } = require('sequelize');

class CorporateService {
  /**
   * Get consolidated corporate summary for Business plan companies.
   * Returns KPIs and branch-level metrics across all company branches.
   *
   * @param {Object} tenant - { companyId, branchId, ... }
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   * @returns {Object} { totalRevenue, totalOrders, activeBranches, avgTicket, branches, revenueByDay }
   */
  static async getCorporateSummary(tenant, startDate, endDate) {
    const { companyId } = tenant
    if (!companyId) throw new Error('companyId required')

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD')
    }
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error('startDate cannot be greater than endDate')
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    // 1. Fetch all branches for this company
    const branches = await db.Branch.findAll({
      where: { companyId },
      attributes: ['id', 'name', 'active'],
    })

    if (branches.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        activeBranches: 0,
        avgTicket: 0,
        branches: [],
        revenueByDay: [],
      }
    }

    const branchIds = branches.map(b => b.id)

    // 2. Get orders for all branches in date range
    const orders = await db.Orders.findAll({
      where: {
        branchId: { [Op.in]: branchIds },
        createdAt: { [Op.between]: [start, end] },
      },
      attributes: ['id', 'branchId', 'totalAmount', 'createdAt'],
      raw: true,
    })

    // 3. Aggregate metrics by branch
    const branchMetrics = {}
    branches.forEach(b => {
      branchMetrics[b.id] = {
        id: b.id,
        name: b.name,
        active: b.active,
        revenue: 0,
        orders: 0,
      }
    })

    let totalRevenue = 0
    let totalOrders = 0

    orders.forEach(order => {
      const amount = parseFloat(order.totalAmount) || 0
      branchMetrics[order.branchId].revenue += amount
      branchMetrics[order.branchId].orders += 1
      totalRevenue += amount
      totalOrders += 1
    })

    // 4. Sort branches by revenue (descending)
    const branchList = Object.values(branchMetrics)
      .sort((a, b) => b.revenue - a.revenue)

    // 5. Daily revenue breakdown (last 30 days max, or full range if smaller)
    const revenueByDay = this._buildDailyRevenue(orders, startDate, endDate)

    // 6. Calculate averages
    const activeBranches = branches.filter(b => b.active).length
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      totalRevenue,
      totalOrders,
      activeBranches,
      avgTicket,
      branches: branchList,
      revenueByDay,
    }
  }

  /**
   * Build daily revenue data for chart.
   * Returns array of { date, revenue } objects.
   */
  static _buildDailyRevenue(orders, startDate, endDate) {
    const dailyMap = {}
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Initialize all days in range with 0 revenue
    const current = new Date(start)
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0]
      dailyMap[dateStr] = 0
      current.setDate(current.getDate() + 1)
    }

    // Aggregate orders by date
    orders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0]
      if (dateStr in dailyMap) {
        dailyMap[dateStr] += parseFloat(order.totalAmount) || 0
      }
    })

    // Convert to array format for chart
    return Object.entries(dailyMap).map(([date, revenue]) => ({
      date,
      revenue: parseFloat(revenue.toFixed(2)),
    }))
  }
}

module.exports = CorporateService
