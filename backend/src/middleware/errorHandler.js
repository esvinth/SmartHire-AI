const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const { nodeEnv } = require('../config/env');

const errorHandler = (err, req, res, _next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    error = new ApiError(statusCode, message);
  }

  const response = {
    success: false,
    message: error.message,
    ...(error.errors.length > 0 && { errors: error.errors }),
    ...(nodeEnv === 'development' && { stack: err.stack }),
  };

  if (error.statusCode >= 500) {
    logger.error(`${error.statusCode} - ${error.message}`, { stack: err.stack });
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
