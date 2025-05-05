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
