const catchAsync = require('../utils/catchAsync');
const userServices = require('../services/users.services');
const AuthServices = require('../services/auth.services');
const AppError = require('../utils/appError');
const bcrypt = require('bcrypt');

exports.create = catchAsync(async (req, res) => {
  const { username, password, name, lastname } = req.body;
  await userServices.create({ username, password, name, lastname });
  return res.status(201).json({
    status: 'success',
    message: 'User created successfully',
  });
});

exports.getUsersInformations = catchAsync(async (req, res) => {
  const usersInfo = await userServices.getUsersInfo();
  return res.json(usersInfo);
});

exports.userLogin = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  const user = await userServices.getUser(username);
  if (!user) {
    return next(new AppError('Invalid username', 400));
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return next(new AppError("The password doesn't match with username", 400));
  }
  const { id } = user;
  const role = user.UsersRoles[0].Role.name;
  const token = AuthServices.genToken({ id, username, role });
  return res.json({ token });
});

exports.getUserbyId = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await userServices.getUserInfoById(id);
  return res.json({ user });
});

exports.updateUserInfo = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, lastname, active } = req.body;
  await userServices.updateUserInfo(id, name, lastname, active);
  return res.sendStatus(204);
});

exports.deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  await userServices.deleteUser(id);
  return res.sendStatus(204);
});
