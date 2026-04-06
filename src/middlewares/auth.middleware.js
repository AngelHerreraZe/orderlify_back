const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const db = require('../database/models/index');
require('dotenv').config();

const authenticate = async (req, res, next) => {
  const token = req.headers['auth-token'];
  if (!token) return next(new AppError('No token provided', 401));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.SECRETWORD, {
      algorithms: ['HS512'],
    });
  } catch {
    return next(new AppError('Invalid or expired token', 401));
  }

  // Validar que la empresa sigue activa en cada request.
  // Detecta suspensiones que ocurren DESPUÉS de que el token fue emitido.
  const company = await db.Company.findByPk(decoded.companyId, {
    attributes: ['id', 'status'],
  });

  if (!company || company.status !== 'active') {
    return next(
      new AppError('Acceso denegado: empresa inactiva o suspendida', 403),
    );
  }

  // Rol siempre desde DB — nunca stale desde el token.
  // Prioriza el rol marcado como primario.
  const userRole = await db.UsersRoles.findOne({
    where: { userId: decoded.id, isPrimary: true },
    include: [{ model: db.Roles }],
  });

  // Fallback: si ninguno tiene isPrimary=true, toma cualquiera
  const roleRecord =
    userRole ??
    (await db.UsersRoles.findOne({
      where: { userId: decoded.id },
      include: [{ model: db.Roles }],
    }));

  if (!roleRecord) return next(new AppError('User has no role assigned', 403));

  req.user = {
    id: decoded.id,
    username: decoded.username,
    companyId: decoded.companyId, // desde JWT — validado arriba contra DB
    role: roleRecord.Role.name,   // siempre desde DB
  };

  next();
};

module.exports = authenticate;
