/**
 * Standard API response helper functions
 */

export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, message = 'An error occurred', statusCode = 500, code = 'INTERNAL_ERROR') => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};
