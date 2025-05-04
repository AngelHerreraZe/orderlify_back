const catchAsync = require('../utils/catchAsync');
const ordersServices = require('../services/orders.services');

exports.createOrder = catchAsync(async (req, res, next) => {
  try {
    const { tableId, userId, status, total } = req.body;
    await ordersServices.createOrder(tableId, userId, status, total);
    return res.sendStatus(200);
  } catch (error) {
    throw error;
  }
});

exports.getOrders = catchAsync(async (req, res, next) => {
  try {
    const orders = await ordersServices.getOrders();
    return res.json({ orders });
  } catch (error) {
    throw error;
  }
});

exports.getOrderById = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await   ordersServices.getOrderById(id);
    return res.json({ order });
  } catch (error) {
    throw error;
  }
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  try {
    const { tableId, userId, status, total } = req.body;
    const { id } = req.params;
    await ordersServices.updateOrder(tableId, userId, status, total, id);
    return res.sendStatus(204);
  } catch (error) {
    throw error;
  }
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    await ordersServices.deleteOrder(id);
    return res.sendStatus(204);
  } catch (error) {
    throw error;
  }
});
