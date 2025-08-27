/**
 * Standard API response utility functions
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
export const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} errors - Detailed error information
 */
export const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

/**
 * Remove sensitive fields from user object
 * @param {Object} user - User object from database
 * @returns {Object} - Sanitized user object
 */
export const sanitizeUser = (user) => {
  if (!user) return null;
  
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};
