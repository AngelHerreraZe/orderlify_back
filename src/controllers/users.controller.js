const catchAsync = require('../utils/catchAsync');
const userServices = require('../services/users.services');
const AuthServices = require('../services/auth.services');
const AppError = require('../utils/appError');
const bcrypt = require('bcrypt');

exports.create = catchAsync(async (req, res) => {
  const { username, password, name, lastname } = req.body;
  const user = await userServices.create({
    username,
    password,
    name,
    lastname,
  });
  return res.status(201).json({
    status: 'success',
    message: 'User created successfully',
    user: { id: user.id, username: user.username },
  });
});

exports.getUsersInformations = catchAsync(async (req, res) => {
  const usersInfo = await userServices.getUsersInfo();
  return res.json(usersInfo);
});

exports.userLogin = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  const user = await userServices.getUser(username);
  if (!user) return next(new AppError('Invalid username', 400));

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return next(new AppError("Password doesn't match", 400));

  const token = AuthServices.genToken({ id: user.id, username: user.username });
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

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Se requieren contraseña actual y nueva', 400));
  }

  if (newPassword.length < 8) {
    return next(
      new AppError('La nueva contraseña debe tener al menos 8 caracteres', 400),
    );
  }
  const updatedUser = await userServices.changePassword(
    userId,
    currentPassword,
    newPassword,
  );

  const role = updatedUser.UsersRoles?.[0]?.Role?.name;

  const token = AuthServices.genToken({
    id: updatedUser.id,
    username: updatedUser.username,
    role,
    passwordChanged: updatedUser.passwordChanged,
  });

  return res.json({ token });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const user = await userServices.getUserInfoById(id);
  if (!user) return next(new AppError('Usuario no encontrado', 404));

  // passwordChanged viene directo de la BD via getUserRawById
  const raw = await userServices.getUserRawById(id);

  return res.json({
    id: user.id,
    username: user.username,
    role: user.UsersRoles?.[0]?.Role?.name ?? req.user.role,
    passwordChanged: raw.passwordChanged, // booleano desde la BD ✅
  });
});
