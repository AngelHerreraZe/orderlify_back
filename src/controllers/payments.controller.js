const catchAsync = require('../utils/catchAsync');
const paymentsServices = require('../services/payments.services');

exports.registerPayment = catchAsync(async (req, res, next) => {
  try {
    const { orderId, ammount, method } = req.body;
    await paymentsServices.registerPayment(orderId, ammount, method);
    return res.sendStatus(200);
  } catch (error) {
    throw error;
  }
});

exports.getAllPayments = catchAsync(async (req, res, next) => {
  try {
    const payments = await paymentsServices.getAllPayments();
    return res.json({ payments });
  } catch (error) {
    throw error;
  }
});

exports.getOnePayment = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await paymentsServices.getOnePayment(id);
    return res.json({ payment });
  } catch (error) {
    throw error;
  }
});