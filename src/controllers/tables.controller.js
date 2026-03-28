const catchAsync      = require('../utils/catchAsync');
const tablesServices  = require('../services/tables.services');
const { getIO }       = require('../socket');

const TABLE_ROLES = ['Mesero', 'admin'];

exports.createTable = catchAsync(async (req, res) => {
  const { tableNumber, capacity } = req.body;
  const table = await tablesServices.createTable(tableNumber, capacity);

  getIO().to(TABLE_ROLES).emit('table:updated', { action: 'created', table });

  return res.status(201).json({ table });
});

exports.getTables = catchAsync(async (req, res) => {
  const tables = await tablesServices.getTables();
  return res.json({ tables });
});

exports.updateTable = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { tableNumber, capacity } = req.body;
  await tablesServices.updateTable(id, tableNumber, capacity);

  getIO().to(TABLE_ROLES).emit('table:updated', {
    action: 'updated',
    table: { id: parseInt(id), tableNumber, capacity },
  });

  return res.sendStatus(204);
});

exports.deleteTable = catchAsync(async (req, res) => {
  const { id } = req.params;
  await tablesServices.deleteTable(id);

  getIO().to(TABLE_ROLES).emit('table:deleted', { id: parseInt(id) });

  return res.sendStatus(204);
});
