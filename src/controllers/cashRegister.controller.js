'use strict';
const catchAsync           = require('../utils/catchAsync');
const AppError             = require('../utils/appError');
const CashRegisterServices = require('../services/cashRegister.services');

exports.getCurrent = catchAsync(async (req, res) => {
  const shift = await CashRegisterServices.getCurrentShift(req.tenant);
  if (!shift) return res.json({ shift: null });

  const totalCashReceived = await CashRegisterServices.computeCashReceived(shift, req.tenant);
  const expectedBalance   = (shift.openingBalance || 0) + totalCashReceived;
  const plain             = shift.toJSON();

  return res.json({ shift: { ...plain, totalCashReceived, expectedBalance } });
});

exports.openShift = catchAsync(async (req, res) => {
  const { openingBalance } = req.body;
  const userId = req.user?.id ?? null;
  const shift  = await CashRegisterServices.openShift(openingBalance, userId, req.tenant);
  return res.status(201).json({ shift });
});

exports.closeShift = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { closingBalance, notes } = req.body;
  if (closingBalance == null) throw new AppError('closingBalance es requerido', 400);
  const shift = await CashRegisterServices.closeShift(id, closingBalance, notes, req.tenant);
  return res.json({ shift });
});

exports.listShifts = catchAsync(async (req, res) => {
  const shifts = await CashRegisterServices.listShifts(req.tenant);
  return res.json({ shifts });
});
