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
