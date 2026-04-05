'use strict';
const catchAsync     = require('../utils/catchAsync');
const tablesServices = require('../services/tables.services');
const { getIO }      = require('../socket');

exports.createTable = catchAsync(async (req, res) => {
  const { tableNumber, capacity } = req.body;
  const branchId = req.tenant?.branchId ?? null;
  const table = await tablesServices.createTable(tableNumber, capacity, branchId);
  getIO()?.emit('table:updated', { action: 'created', table, branchId });
  return res.status(201).json({ table });
});

exports.getTables = catchAsync(async (req, res) => {
  const tables = await tablesServices.getTables(req.tenant);
  return res.json({ tables });
});

exports.updateTable = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { tableNumber, capacity } = req.body;
  await tablesServices.updateTable(id, tableNumber, capacity);
  getIO()?.emit('table:updated', { action: 'updated', table: { id: parseInt(id), tableNumber, capacity } });
  return res.sendStatus(204);
});

exports.deleteTable = catchAsync(async (req, res) => {
  const { id } = req.params;
  await tablesServices.deleteTable(id);
  getIO()?.emit('table:deleted', { id: parseInt(id) });
  return res.sendStatus(204);
});
