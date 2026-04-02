const AppError = require('../utils/appError');

const mustHaveChangedPassword = (req, res, next) => {
  if (!req.user?.passwordChanged) {
    return next(
      new AppError(
        'Debes cambiar tu contraseña antes de continuar',
        403
      )
    );
  }
  next();
};

module.exports = mustHaveChangedPassword;