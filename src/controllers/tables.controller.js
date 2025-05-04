const catchAsync = require('../utils/catchAsync');
const tablesServices = require('../services/tables.services');

exports.createTable = catchAsync(async (req, res, next) => {
  try {
    const { tableNumber, capacity } = req.body;
    await tablesServices.createTable(tableNumber, capacity);
    return res.sendStatus(200);
  } catch (error) {
    throw error;
  }
});

exports.getTables = catchAsync(async (req, res, next) => {
  try {
    const tables = await tablesServices.getTables();
    return res.json({ tables });
  } catch (error) {
    throw error;
  }
});

exports.updateTable = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tableNumber, capacity } = req.body;
    await tablesServices.updateTable(id, tableNumber, capacity);
    return res.sendStatus(204);
  } catch (error) {
    throw error;
  }
});

exports.deleteTable = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    await tablesServices.deleteTable(id);
    return res.sendStatus(204);
  } catch (error) {
    throw error;
  }
});
