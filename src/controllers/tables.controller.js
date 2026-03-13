const catchAsync = require('../utils/catchAsync');
const tablesServices = require('../services/tables.services');

exports.createTable = catchAsync(async (req, res) => {
  const { tableNumber, capacity } = req.body;
  await tablesServices.createTable(tableNumber, capacity);
  return res.sendStatus(200);
});

exports.getTables = catchAsync(async (req, res) => {
  const tables = await tablesServices.getTables();
  return res.json({ tables });
});

exports.updateTable = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { tableNumber, capacity } = req.body;
  await tablesServices.updateTable(id, tableNumber, capacity);
  return res.sendStatus(204);
});

exports.deleteTable = catchAsync(async (req, res) => {
  const { id } = req.params;
  await tablesServices.deleteTable(id);
  return res.sendStatus(204);
});
