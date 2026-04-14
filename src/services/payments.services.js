'use strict';
const db = require('../database/models/index');

class paymentsServices {
  static async registerPayment(orderId, amount, method, receivedAmount) {
    const paidAt      = new Date();
    const changeGiven = (method === 'Efectivo' && receivedAmount != null)
      ? Math.max(0, parseFloat(receivedAmount) - parseFloat(amount))
      : null;

    const payment = await db.Payments.create({
      orderId,
      amount,
      method,
      paidAt,
      receivedAmount: method === 'Efectivo' ? (receivedAmount ?? null) : null,
      changeGiven,
    });
    return payment.toJSON();
  }

  /**
   * List payments scoped to the current tenant.
   * Tenant filtering is done via the Order association (3NF — payments no longer
   * store company_id / branch_id directly).
   */
  static async getAllPayments(tenant = {}) {
    const orderWhere = {};
    if (tenant.companyId) orderWhere.companyId = tenant.companyId;
    if (tenant.branchId)  orderWhere.branchId  = tenant.branchId;

    const hasFilter = Object.keys(orderWhere).length > 0;

    const payments = await db.Payments.findAll({
      include: [{
        model:      db.Orders,
        attributes: [],
        where:      hasFilter ? orderWhere : undefined,
        required:   hasFilter,
      }],
    });
    return payments;
  }

  static async getOnePayment(id) {
    return db.Payments.findOne({ where: { id } });
  }
}

module.exports = paymentsServices;
