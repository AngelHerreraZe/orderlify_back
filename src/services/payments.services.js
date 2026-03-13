const db = require('../database/models/index');

class paymentsServices {
  static async registerPayment(orderId, amount, method) {
    const paidAt = new Date();
    await db.Payments.create({ orderId, amount, method, paidAt });
  }

  static async getAllPayments() {
    const payments = await db.Payments.findAll();
    return payments;
  }

  static async getOnePayment(id) {
    const payment = await db.Payments.findOne({ where: { id } });
    return payment;
  }
}

module.exports = paymentsServices;
