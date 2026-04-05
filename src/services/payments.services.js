'use strict';
const db = require('../database/models/index');

class paymentsServices {
  static async registerPayment(orderId, ammount, method, tenant = {}) {
    const { companyId = null, branchId = null } = tenant;
    const paidAt = new Date();
    await db.Payments.create({ orderId, ammount, method, paidAt, companyId, branchId });
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
