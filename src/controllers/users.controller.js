const catchAsync = require('../utils/catchAsync');
const userServices = require('../services/users.services');
const AuthServices = require('../services/auth.services');
const AppError = require('../utils/appError');
const bcrypt = require('bcrypt');

exports.create = catchAsync(async (req, res, next) => {
  const { username, password, name, lastname, roleId } = req.body;
  const creatorRole = req.user.role;

  // Regla 8 & 9: Manager sólo puede crear roles que no sean Admin ni Manager.
  // Si se envía un roleId, validamos el rol destino.
  if (creatorRole === 'Manager' && roleId) {
    const db = require('../database/models/index');
    const targetRole = await db.Roles.findByPk(roleId);
    if (targetRole && (targetRole.name === 'Admin' || targetRole.name === 'Manager')) {
      return next(
        new AppError('Un Manager no puede crear usuarios con rol Admin o Manager', 403),
      );
    }
  }

  // Regla 6: No se pueden crear Admins extra por esta vía (solo en registro inicial).
  if (roleId) {
    const db = require('../database/models/index');
    const targetRole = await db.Roles.findByPk(roleId);
    if (targetRole && targetRole.name === 'Admin') {
      return next(
        new AppError('No se puede crear un usuario Admin por esta vía. El Admin se crea al registrar la empresa.', 403),
      );
    }
  }

  const user = await userServices.create({
    username,
    password,
    name,
    lastname,
    companyId: req.user.companyId,
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

exports.updateUserInfo = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, lastname, active } = req.body;

  // Regla 7: El usuario Admin no puede modificarse por esta vía (solo panel de control).
  const db = require('../database/models/index');
  const targetUserRole = await db.UsersRoles.findOne({
    where: { userId: id, isPrimary: true },
    include: [{ model: db.Roles }],
  });
  if (targetUserRole?.Role?.name === 'Admin') {
    return next(
      new AppError('El usuario Administrador solo puede modificarse desde el panel de control.', 403),
    );
  }

  // Regla 9: Manager no puede editar usuarios Manager
  if (req.user.role === 'Manager' && targetUserRole?.Role?.name === 'Manager') {
    return next(
      new AppError('Un Manager no puede modificar a otro Manager.', 403),
    );
  }

  await userServices.updateUserInfo(id, name, lastname, active);
  return res.sendStatus(204);
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Regla 7: El usuario Admin no puede eliminarse por esta vía (solo panel de control).
  const db = require('../database/models/index');
  const targetUserRole = await db.UsersRoles.findOne({
    where: { userId: id, isPrimary: true },
    include: [{ model: db.Roles }],
  });
  if (targetUserRole?.Role?.name === 'Admin') {
    return next(
      new AppError('El usuario Administrador solo puede eliminarse desde el panel de control.', 403),
    );
  }

  // Regla 9: Manager no puede eliminar a otro Manager
  if (req.user.role === 'Manager' && targetUserRole?.Role?.name === 'Manager') {
    return next(
      new AppError('Un Manager no puede eliminar a otro Manager.', 403),
    );
  }

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

/**
 * PUT /users/:id/password
 * Usuario cambia su propia contraseña. Se rechaza si :id ≠ token.id.
 */
exports.changePasswordById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Protección de identidad: sólo el propio usuario puede cambiar su contraseña
  if (String(req.user.id) !== String(id)) {
    return next(new AppError('No puedes cambiar la contraseña de otro usuario', 403));
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Se requieren contraseña actual y nueva', 400));
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return next(new AppError('La nueva contraseña debe tener al menos 8 caracteres', 400));
  }

  if (currentPassword === newPassword) {
    return next(new AppError('La nueva contraseña debe ser diferente a la actual', 400));
  }

  const updatedUser = await userServices.changePassword(id, currentPassword, newPassword);

  const role = updatedUser.UsersRoles?.[0]?.Role?.name;
  const AuthServices = require('../services/auth.services');
  const token = AuthServices.genToken({
    id: updatedUser.id,
    username: updatedUser.username,
    companyId: updatedUser.companyId,
    role,
    passwordChanged: updatedUser.passwordChanged,
  });

  return res.status(200).json({
    status: 'success',
    message: 'Contraseña actualizada correctamente',
    token,
  });
});

exports.deviceAuth = catchAsync(async (req, res, next) => {
  const { empresa, correo, serial } = req.body;

  if (!empresa || !correo || !serial) {
    return next(new AppError('Se requieren empresa, correo y serial', 400));
  }

  const db = require('../database/models/index');
  const { Op } = require('sequelize');

  const company = await db.Company.findOne({
    where: {
      [Op.or]: [{ subdomain: empresa.trim().toLowerCase() }, { name: empresa.trim() }],
      email: correo.trim().toLowerCase(),
      serial: serial.trim(),
    },
    attributes: ['id', 'name', 'subdomain', 'status', 'serial', 'plan'],
  });

  if (!company) {
    return next(new AppError('Datos de empresa incorrectos', 401));
  }

  if (company.status !== 'active') {
    return next(new AppError('Empresa suspendida. Contacte a soporte.', 403));
  }

  if (!company.serial) {
    return next(new AppError('Esta empresa no tiene un serial asignado', 403));
  }

  const deviceToken = AuthServices.genToken({
    deviceVerified: true,
    companyId: company.id,
    subdomain: company.subdomain,
  });

  return res.json({
    status: 'success',
    message: 'Empresa verificada. Puede continuar al login.',
    deviceToken,
    company: {
      id: company.id,
      name: company.name,
      subdomain: company.subdomain,
      plan: company.plan,
    },
  });
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
