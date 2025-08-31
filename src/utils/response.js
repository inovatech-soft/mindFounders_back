/**
 * Standard API response utility functions
 */

/**
 * Create success response object
 * @param {string} message - Success message
 * @param {Object} data - Data to send
 * @returns {Object} - Success response object
 */
export const createSuccessResponse = (message = 'Success', data = {}) => {
  return {
    success: true,
    message,
    data,
  };
};

/**
 * Create error response object
 * @param {string} message - Error message
 * @param {string} errorCode - Error code
 * @param {Object} errors - Detailed error information
 * @returns {Object} - Error response object
 */
export const createErrorResponse = (message = 'Internal Server Error', errorCode = 'INTERNAL_ERROR', errors = null) => {
  return {
    success: false,
    message,
    errorCode,
    ...(errors && { errors }),
  };
};

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
export const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json(createSuccessResponse(message, data));
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} errors - Detailed error information
 */
export const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json(createErrorResponse(message, 'HTTP_ERROR', errors));
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
