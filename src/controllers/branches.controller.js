'use strict';
const catchAsync       = require('../utils/catchAsync');
const branchesServices = require('../services/branches.services');

exports.getBranches = catchAsync(async (req, res) => {
  const companyId = req.tenant?.companyId;
  if (!companyId) return res.status(400).json({ message: 'x-company-id header required' });
  const branches = await branchesServices.getBranchesByCompany(companyId);
  return res.json({ branches });
});

exports.getBranchById = catchAsync(async (req, res) => {
  const branch = await branchesServices.getBranchById(req.params.id);
  if (!branch) return res.status(404).json({ message: 'Branch not found' });
  return res.json({ branch });
});

exports.createBranch = catchAsync(async (req, res) => {
  const { name, address, phone } = req.body;
  const companyId = req.tenant?.companyId;
  if (!companyId) return res.status(400).json({ message: 'x-company-id header required' });
  const branch = await branchesServices.createBranch(companyId, name, address, phone);
  return res.status(201).json({ branch });
});

exports.updateBranch = catchAsync(async (req, res) => {
  await branchesServices.updateBranch(req.params.id, req.body);
  return res.sendStatus(204);
});

exports.deactivateBranch = catchAsync(async (req, res) => {
  await branchesServices.deactivateBranch(req.params.id);
  return res.sendStatus(204);
});

// Auto-detect context (used by frontend on init)
exports.resolveContext = catchAsync(async (req, res) => {
  const companyId = req.tenant?.companyId;
  if (!companyId) return res.status(400).json({ message: 'x-company-id header required' });
  const context = await branchesServices.resolveAutoContext(companyId);
  if (!context) return res.status(404).json({ message: 'No active branches found' });
  return res.json({ context });
});
