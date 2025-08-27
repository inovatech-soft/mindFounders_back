import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
export const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};
