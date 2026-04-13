const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
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

exports.assignRole = catchAsync(async (req, res, next) => {
  const { userId, roleId } = req.params;
  const db = require('../database/models/index');

  // No se puede asignar rol Admin por esta vía
  const targetRole = await db.Roles.findByPk(roleId);
  if (targetRole?.name === 'Admin') {
    return next(
      new AppError('No se puede asignar el rol Admin por esta vía.', 403),
    );
  }

  // Manager no puede asignar rol Manager
  if (req.user?.role === 'Manager' && targetRole?.name === 'Manager') {
    return next(
      new AppError('Un Manager no puede asignar el rol Manager.', 403),
    );
  }

  await RolesServices.assignRole(userId, roleId);
  return res.sendStatus(200);
});
