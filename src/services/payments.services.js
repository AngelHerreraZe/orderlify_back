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
}

module.exports = paymentsServices;
