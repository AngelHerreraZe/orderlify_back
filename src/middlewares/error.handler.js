const {
  ValidationError,
  DatabaseError,
  ConnectionError,
  ConnectionAcquireTimeoutError,
  ConnectionRefusedError,
  ConnectionTimedOutError,
  InvalidConnectionError,
} = require('sequelize');

const logError = (error, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(error);
  }
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || error.status || 500;
  return res.status(statusCode).json({
    status: error.status || 'error',
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

const ormErrorHandler = (error, req, res, next) => {
  if (
    error instanceof ConnectionError ||
    error instanceof ConnectionTimedOutError ||
    error instanceof ConnectionRefusedError ||
    error instanceof InvalidConnectionError ||
    error instanceof ConnectionAcquireTimeoutError
  ) {
    return res.status(503).json({
      status: 'error',
      message: 'Database connection error',
    });
  }

  if (error instanceof ValidationError) {
    return res.status(422).json({
      status: 'fail',
      message: error.message,
      errors: error.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (error instanceof DatabaseError) {
    return res.status(500).json({
      status: 'error',
      message: 'Database error',
      ...(process.env.NODE_ENV === 'development' && { detail: error.message }),
    });
  }

  next(error);
};

module.exports = { logError, errorHandler, ormErrorHandler };
