const catchAsync = require('../utils/catchAsync');
const ordersServices = require('../services/orders.services');

exports.createOrder = catchAsync(async (req, res) => {
  const { tableId, userId, status, total } = req.body;
  const order = await ordersServices.createOrder(tableId, userId, status, total);
  return res.status(201).json({ order });
});

exports.getOrders = catchAsync(async (req, res) => {
  const orders = await ordersServices.getOrders();
  return res.json({ orders });
});

exports.getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const order = await ordersServices.getOrderById(id);
  return res.json({ order });
});

exports.updateOrder = catchAsync(async (req, res) => {
  const { tableId, userId, status, total } = req.body;
  const { id } = req.params;
  await ordersServices.updateOrder(tableId, userId, status, total, id);
  return res.sendStatus(204);
});

exports.deleteOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  await ordersServices.deleteOrder(id);
  return res.sendStatus(204);
});

exports.addItemsToOrder = catchAsync(async (req, res) => {
  const items = req.body;
  const orderId = req.params.orderId;
  const itemsArray = Object.values(items).map((item) => ({
    ...item,
    orderId: parseInt(orderId),
    // excludedIngredients comes directly from the item if present
    excludedIngredients: item.excludedIngredients ?? null,
  }));
  await ordersServices.addItemsToOrder(itemsArray);
  return res.sendStatus(200);
});

exports.editOrderItems = catchAsync(async (req, res) => {
  const { orderId, productId } = req.params;
  const { quantity, price, excludedIngredients } = req.body;
  await ordersServices.editOrderItems(orderId, productId, quantity, price, excludedIngredients);
  return res.sendStatus(204);
});

exports.deleteOrderItem = catchAsync(async (req, res) => {
  const { orderId, productId } = req.params;
  await ordersServices.deleteOrderItem(orderId, productId);
  return res.sendStatus(204);
});
