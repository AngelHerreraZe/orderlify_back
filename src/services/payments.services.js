const db = require('../database/models/index');

class paymentsServices {
  static async registerPayment(orderId, ammount, method) {
    try {
      const paidAt = Date.now();
      await db.Payments.create({
        orderId,
        ammount,
        method,
        paidAt,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getAllPayments() {
    try {
      const payments = db.Payments.findAll();
      return payments;
    } catch (error) {
      throw error;
    }
  }

  static async getOnePayment(id) {
    try {
      const payment = db.Payments.findOne({
        where: { id },
      });
      return payment
    } catch (error) {
      throw error;
    }
  }
}

module.exports = paymentsServices;