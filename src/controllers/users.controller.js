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

  // Subdominio opcional: permite inferir la empresa sin selección manual.
  // El frontend envía el subdominio de la URL (ej: "pepito" de pepito.mipos.com).
  const subdomain = req.headers['x-subdomain'] ?? null;

  const user = await userServices.getUser(username, subdomain);

  // Mensaje genérico deliberado — no revelar si es username o password
  if (!user) return next(new AppError('Credenciales inválidas', 401));
  if (!user.active) return next(new AppError('Credenciales inválidas', 401));

  // Validar empresa antes de verificar contraseña
  if (!user.company) {
    return next(new AppError('Usuario sin empresa asignada', 403));
  }
  if (user.company.status !== 'active') {
    return next(
      new AppError('Empresa suspendida. Contacte a soporte.', 403),
    );
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return next(new AppError('Credenciales inválidas', 401));

  const role = user.UsersRoles?.[0]?.Role?.name ?? null;

  // companyId va en el token — tenant.middleware.js lo extrae de aquí
  const token = AuthServices.genToken({
    id: user.id,
    username: user.username,
    companyId: user.companyId,
    role,
    passwordChanged: user.passwordChanged,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      role,
      companyId: user.companyId,
      passwordChanged: user.passwordChanged,
    },
  });
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
    companyId: raw.companyId ?? null,     // multi-tenant context
  });
});
