'use strict';
const catchAsync     = require('../utils/catchAsync');
const tablesServices = require('../services/tables.services');
const { getIO }      = require('../socket');
const AppError       = require('../utils/appError');

exports.createTable = catchAsync(async (req, res) => {
  const {
    tableNumber,
    capacity,
    autoCommandEnabled = false,
    qrDurationMinutes  = null,
  } = req.body;

  const branchId = req.tenant?.branchId ?? null;

  // Resolver nombres para la ruta de Firebase
  const db = require('../database/models/index');
  let companyName = 'restaurant';
  let branchName  = 'main';

  let subdomain = null;
  if (req.tenant?.companyId) {
    const company = await db.Company.findByPk(req.tenant.companyId, { attributes: ['name', 'subdomain'] });
    if (company) {
      companyName = company.subdomain ?? company.name;
      subdomain   = company.subdomain ?? null;
    }
  }
  if (branchId) {
    const branch = await db.Branch.findByPk(branchId, { attributes: ['name'] });
    if (branch) branchName = branch.name;
  }

  const table = await tablesServices.createTable({
    tableNumber,
    capacity,
    branchId,
    autoCommandEnabled: Boolean(autoCommandEnabled),
    qrDurationMinutes:  qrDurationMinutes ? Number(qrDurationMinutes) : null,
    tenant: req.tenant ?? {},
    companyName,
    branchName,
    subdomain,
    appUrl: process.env.APP_URL,
  });

  getIO()?.emit('table:updated', { action: 'created', table, branchId });

  return res.status(201).json({ status: 'success', table });
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

exports.regenerateQR = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const db = require('../database/models/index');
  let companyName = 'restaurant';
  let branchName  = 'main';

  let subdomain = null;
  if (req.tenant?.companyId) {
    const company = await db.Company.findByPk(req.tenant.companyId, { attributes: ['name', 'subdomain'] });
    if (company) {
      companyName = company.subdomain ?? company.name;
      subdomain   = company.subdomain ?? null;
    }
  }

  const table = await db.Tables.findByPk(id);
  if (!table) return next(new AppError('Mesa no encontrada', 404));

  if (table.branchId) {
    const branch = await db.Branch.findByPk(table.branchId, { attributes: ['name'] });
    if (branch) branchName = branch.name;
  }

  const updated = await tablesServices.regenerateQR(id, {
    companyName,
    branchName,
    subdomain,
    appUrl: process.env.APP_URL,
  });

  getIO()?.emit('table:qr_updated', { tableId: parseInt(id), qrUrl: updated.qrUrl, qrExpiresAt: updated.qrExpiresAt });

  return res.json({ status: 'success', table: updated });
});
