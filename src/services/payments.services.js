'use strict';
const db = require('../database/models/index');

class paymentsServices {
  static async registerPayment(orderId, amount, method, receivedAmount, tenant = {}) {
    const { companyId = null, branchId = null } = tenant;
    const paidAt      = new Date();
    const changeGiven = (method === 'Efectivo' && receivedAmount != null)
      ? Math.max(0, parseFloat(receivedAmount) - parseFloat(amount))
      : null;
    const payment = await db.Payments.create({
      orderId, amount, method, paidAt, companyId, branchId,
      receivedAmount: method === 'Efectivo' ? (receivedAmount ?? null) : null,
      changeGiven,
    });
    return payment.toJSON();
  }

  static async getAllPayments(tenant = {}) {
    const where = {};
    if (tenant.companyId) where.companyId = tenant.companyId;
    if (tenant.branchId)  where.branchId  = tenant.branchId;

    const payments = await db.Payments.findAll({ where });
    return payments;
  }

  static async getOnePayment(id) {
    const payment = await db.Payments.findOne({ where: { id } });
    return payment;
  }
}

module.exports = paymentsServices;
