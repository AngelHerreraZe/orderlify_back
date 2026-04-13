'use strict';
const { Op } = require('sequelize');
const db = require('../database/models/index');

/**
 * Build a WHERE clause that filters by branchId when present.
 * Backwards-compatible: if no tenant context, returns {} (no filter).
 */
const tenantWhere = ({ companyId, branchId } = {}) => {
  const where = {};
  if (companyId) where.companyId = companyId;
  if (branchId)  where.branchId  = branchId;
  return where;
};

const ORDER_INCLUDE = [
  {
    model: db.OrdersItems,
    include: [{ model: db.Products }],
  },
  { model: db.User,   as: 'user',  attributes: { exclude: ['password', 'active', 'createdAt', 'updatedAt'] } },
  { model: db.Tables, as: 'table', attributes: ['id', 'tableNumber', 'capacity'] },
];

class ordersServices {
  static async createOrder(tableId, userId, status, total, tenant = {}, serviceType = null) {
    const { companyId = null, branchId = null, stationId = null } = tenant;
    const order = await db.Orders.create({ tableId, userId, status, total, companyId, branchId, stationId, serviceType });
    const data = order.toJSON();
    delete data.serviceType;
    return data;
  }

  static async getOrders(tenant = {}) {
    const orders = await db.Orders.findAll({
      where: tenantWhere(tenant),
      attributes: { exclude: ['serviceType'] },
      include: ORDER_INCLUDE,
    });
    return orders;
  }

  static async getOrderById(id) {
    const order = await db.Orders.findOne({
      where: { id },
      attributes: { exclude: ['serviceType'] },
      include: ORDER_INCLUDE,
    });
    return order;
  }

  static async updateOrder(tableId, userId, status, total, id) {
    await db.Orders.update({ tableId, userId, status, total }, { where: { id } });
  }

  static async deleteOrder(id) {
    await db.Orders.destroy({ where: { id } });
  }

  static async addItemsToOrder(itemsArray) {
    const rows = itemsArray.map((item) => ({
      orderId:   item.orderId,
      productId: item.productId,
      quantity:  item.quantity,
      price:     item.price,
      notes:     item.notes || null,
    }));
    await db.OrdersItems.bulkCreate(rows);
  }

  static async editOrderItems(orderId, productId, quantity, price) {
    await db.OrdersItems.update(
      { quantity, price },
      { where: { [Op.and]: [{ productId }, { orderId }] } }
    );
  }

  static async deleteOrderItem(orderId, productId) {
    await db.OrdersItems.destroy({
      where: { [Op.and]: [{ orderId, productId }] },
    });
  }
}

module.exports = ordersServices;
