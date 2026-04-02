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
  const { id, passwordChanged } = user;
  const role = user.UsersRoles[0].Role.name;
  const token = AuthServices.genToken({ id, username, role, passwordChanged });
  return res.json({ token, mustChangePassword: !passwordChanged });
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

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const { id } = req.user; // viene del token vía middleware authenticate

  const user = await userServices.getUserRawById(id); // método nuevo (ver abajo)
  if (!user) return next(new AppError('Usuario no encontrado', 404));

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return next(new AppError('Contraseña actual incorrecta', 400));

  if (currentPassword === newPassword)
    return next(
      new AppError('La nueva contraseña debe ser diferente a la actual', 400),
    );

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await userServices.updatePassword(id, hashedPassword);

  // Emitir un token fresco con passwordChanged: true
  const newToken = AuthServices.genToken({
    id,
    username: user.username,
    role: req.user.role,
    passwordChanged: true,
  });

  return res.json({ token: newToken });
});
