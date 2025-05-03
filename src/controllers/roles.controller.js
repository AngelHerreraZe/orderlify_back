const catchAsync = require('../utils/catchAsync');
const RolesServices = require('../services/roles.services');

exports.create = catchAsync(async (req, res, next) => {
  try {
    const { name } = req.body;
    await RolesServices.create(name);
    return res.sendStatus(200);
  } catch (error) {
    throw error;
  }
});

exports.getRoles = catchAsync(async (req, res, next) => {
  try {
    const roles = await RolesServices.getRoles();
    return res.json({
      roles,
    });
  } catch (error) {
    throw error;
  }
});

exports.updateRole = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await RolesServices.updateRole(id, name);
    return res.sendStatus(204);
  } catch (error) {
    throw error;
  }
});

exports.deleteRole = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    await RolesServices.deleteRole(id);
    return res.sendStatus(204);
  } catch (error) {
    throw error;
  }
});

exports.assignRole = catchAsync(async (req, res, next) => {
  try {
    const { userId, roleId } = req.params;
    await RolesServices.assignRole(userId, roleId)
    return res.sendStatus(200);
  } catch (error) {
    throw error;
  }
});
