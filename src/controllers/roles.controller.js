const catchAsync = require('../utils/catchAsync');
const RolesServices = require('../services/roles.services');

exports.create = catchAsync(async (req, res) => {
  const { name } = req.body;
  await RolesServices.create(name);
  return res.sendStatus(200);
});

exports.getRoles = catchAsync(async (req, res) => {
  const roles = await RolesServices.getRoles();
  return res.json({ roles });
});

exports.updateRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  await RolesServices.updateRole(id, name);
  return res.sendStatus(204);
});

exports.deleteRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  await RolesServices.deleteRole(id);
  return res.sendStatus(204);
});

exports.assignRole = catchAsync(async (req, res) => {
  const { userId, roleId } = req.params;
  await RolesServices.assignRole(userId, roleId);
  return res.sendStatus(200);
});
