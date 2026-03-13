const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
require('dotenv').config();

const authenticate = (req, res, next) => {
  const token = req.headers['auth-token'];
  if (!token) {
    return next(new AppError('No token provided', 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRETWORD, { algorithms: 'HS512' });
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
};

module.exports = authenticate;
