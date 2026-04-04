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

  // Consulta DB en cada request — siempre fresco, nunca stale
  const userRole = await db.UsersRoles.findOne({
    where: { userId: decoded.id },
    include: [{ model: db.Roles }],
  });

  if (!userRole) return next(new AppError('User has no role assigned', 403));

  req.user = {
    id: decoded.id,
    username: decoded.username,
    role: userRole.Role.name, // siempre desde DB
  };

  next();
};

module.exports = authenticate;
