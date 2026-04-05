const { Op } = require('sequelize');
const db = require('../database/models/index');

class ordersServices {
  static async createOrder(tableId, userId, status, total) {
    try {
      await db.Orders.create({ tableId, userId, status, total });
    } catch (error) {
      throw error;
    }
  }

  static async getOrders() {
    try {
      const orders = await db.Orders.findAll({
        include: [
          {
            model: db.OrdersItems,
            include: [{ model: db.Products }],
          },
          { model: db.User,   as: 'user',  attributes: { exclude: ['password', 'active', 'createdAt', 'updatedAt'] } },
          { model: db.Tables, as: 'table', attributes: ['id', 'tableNumber', 'capacity'] },
        ],
      });
      return orders;
    } catch (error) {
      throw error;
    }
  }

  static async getOrderById(id) {
    try {
      const order = await db.Orders.findOne({
        where: { id },
        include: [
          {
            model: db.OrdersItems,
            include: [{ model: db.Products }],
          },
          { model: db.User,   as: 'user',  attributes: { exclude: ['password', 'active', 'createdAt', 'updatedAt'] } },
          { model: db.Tables, as: 'table', attributes: ['id', 'tableNumber', 'capacity'] },
        ],
      });
      return order;
    } catch (error) {
      throw error;
    }
  }

  static async updateOrder(tableId, userId, status, total, id) {
    try {
      await db.Orders.update({ tableId, userId, status, total }, { where: { id } });
    } catch (error) {
      throw error;
    }
  }

  static async deleteOrder(id) {
    try {
      await db.Orders.destroy({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cada elemento del array puede traer { productId, quantity, price, notes? }
   * notes es texto libre con especificaciones del cliente.
   */
  static async addItemsToOrder(itemsArray) {
    try {
      const rows = itemsArray.map((item) => ({
        orderId:   item.orderId,
        productId: item.productId,
        quantity:  item.quantity,
        price:     item.price,
        notes:     item.notes || null,
      }));
      await db.OrdersItems.bulkCreate(rows);
    } catch (error) {
      throw error;
    }
  }

  static async editOrderItems(orderId, productId, quantity, price) {
    try {
      await db.OrdersItems.update(
        { quantity, price },
        { where: { [Op.and]: [{ productId }, { orderId }] } }
      );
    } catch (error) {
      throw error;
    }
  }

  static async deleteOrderItem(orderId, productId) {
    try {
      await db.OrdersItems.destroy({
        where: { [Op.and]: [{ orderId, productId }] },
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ordersServices;
