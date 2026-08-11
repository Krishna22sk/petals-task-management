import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message);

  const statusCode = res.statusCode !== 200 ? res.statusCode : (err.status || 500);
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    error: isProduction ? 'ServerError' : (err.name || 'InternalServerError'),
    message: isProduction && statusCode === 500 
      ? 'An unexpected error occurred. Please contact system administrator.' 
      : (err.message || 'An unexpected error occurred on the server'),
    ...(!isProduction && { stack: err.stack }),
  });
};
