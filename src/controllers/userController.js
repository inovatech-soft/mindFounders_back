/**
 * User Controller
 * Handles HTTP requests and responses for user management
 * Business logic is delegated to UserService
 */

import { UserService } from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { updateProfileSchema, favoritesSchema, responseStyleSchema } from '../utils/validation.js';

/**
 * Get user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user profile using service
    const user = await UserService.getUserProfile(userId);

    if (!user) {
      return sendError(res, 'Usuário não encontrado', 404);
    }

    return sendSuccess(res, { user }, 'Perfil recuperado com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return sendError(res, 'Dados inválidos', 400, errors);
    }

    const userId = req.user.id;

    // Convert favorites array to JSON string if it's an array
    const processedData = { ...value };
    if (Array.isArray(processedData.favorites)) {
      processedData.favorites = JSON.stringify(processedData.favorites);
    }

    // Update user profile using service
    const updatedUser = await UserService.updateUserProfile(userId, processedData);

    return sendSuccess(res, { user: updatedUser }, 'Perfil atualizado com sucesso');
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Update user favorites
 */
export const updateFavorites = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = favoritesSchema.validate(req.body);
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return sendError(res, 'Dados inválidos', 400, errors);
    }

    const userId = req.user.id;
    const { favorites } = value;

    // Update favorites using service
    const updatedUser = await UserService.updateUserFavorites(userId, favorites);

    return sendSuccess(res, { user: updatedUser }, 'Favoritos atualizados com sucesso');
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Update user response style
 */
export const updateResponseStyle = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = responseStyleSchema.validate(req.body);
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return sendError(res, 'Dados inválidos', 400, errors);
    }

    const userId = req.user.id;
    const { responseStyle } = value;

    // Update response style using service
    const updatedUser = await UserService.updateUserResponseStyle(userId, responseStyle);

    return sendSuccess(res, { user: updatedUser }, 'Estilo de resposta atualizado com sucesso');
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};
