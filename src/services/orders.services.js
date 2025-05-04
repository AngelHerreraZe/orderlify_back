const db = require('../database/models/index');

class ordersServices {
  static async createOrder(tableId, userId, status, total) {
    try {
      await db.Orders.create({
        tableId,
        userId,
        status,
        total,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getOrders() {
    try {
      const orders = await db.Orders.findAll();
      return orders;
    } catch (error) {
      throw error;
    }
  }

  static async getOrderById(id) {
    try {
      const order = await db.Orders.findOne({
        where: {
          id,
        },
      });
      return order;
    } catch (error) {
      throw error;
    }
  }

  static async updateOrder(tableId, userId, status, total, id) {
    try {
      await db.Orders.update(
        {
          tableId,
          userId,
          status,
          total,
        },
        { where: { id } }
      );
    } catch (error) {
      throw error;
    }
  }

  static async deleteOrder(id) {
    try {
      await db.Orders.destroy({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ordersServices;
