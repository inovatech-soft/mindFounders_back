/**
 * Authentication Controller
 * Handles HTTP requests and responses for authentication
 * Business logic is delegated to AuthService
 */

import { AuthService } from '../services/authService.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { registerSchema, loginSchema } from '../utils/validation.js';

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return sendError(res, 'Dados inválidos', 400, errors);
    }

    // Create user using service
    const user = await AuthService.createUser(value);

    // Generate JWT token
    const token = generateToken(user);

    return sendSuccess(res, {
      user,
      token,
    }, 'Usuário criado com sucesso', 201);

  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return sendError(res, 'Dados inválidos', 400, errors);
    }

    // Authenticate user using service
    const user = await AuthService.authenticateUser(value);

    // Generate JWT token
    const token = generateToken(user);

    return sendSuccess(res, {
      user,
      token,
    }, 'Login realizado com sucesso');

  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};
