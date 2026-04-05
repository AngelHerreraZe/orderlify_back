'use strict';
const catchAsync      = require('../utils/catchAsync');
const paymentsServices = require('../services/payments.services');

exports.registerPayment = catchAsync(async (req, res) => {
  const { orderId, amount, method } = req.body;
  await paymentsServices.registerPayment(orderId, amount, method, req.tenant);
  return res.sendStatus(200);
});

exports.getAllPayments = catchAsync(async (req, res) => {
  const payments = await paymentsServices.getAllPayments(req.tenant);
  return res.json({ payments });
});

exports.getOnePayment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payment = await paymentsServices.getOnePayment(id);
  return res.json({ payment });
});
