const db = require('../database/models/index');

class ordersServices {
  static async createOrder(tableId, userId, status, total) {
    try {
      await db.Orders.create({ tableId, userId, status, total });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ordersServices;
