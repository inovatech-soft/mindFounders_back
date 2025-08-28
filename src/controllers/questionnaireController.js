/**
 * Questionnaire Controller
 * Handles HTTP requests and responses for questionnaire management
 * Business logic is delegated to QuestionnaireService
 */

import { QuestionnaireService } from '../services/questionnaireService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { questionnaireSchema, questionnaireUpdateSchema } from '../utils/validation.js';

/**
 * Create a new questionnaire
 */
export const createQuestionnaire = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = questionnaireSchema.validate(req.body);
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return sendError(res, 'Dados inválidos', 400, errors);
    }

    const userId = req.user.id;

    // Create questionnaire using service
    const questionnaire = await QuestionnaireService.createQuestionnaire(userId, value);

    return sendSuccess(res, {
      questionnaire,
    }, 'Questionário criado com sucesso', 201);

  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Get user questionnaire
 */
export const getQuestionnaire = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get questionnaire using service
    const questionnaire = await QuestionnaireService.getQuestionnaireByUserId(userId);

    if (!questionnaire) {
      return sendError(res, 'Questionário não encontrado. Complete o questionário primeiro.', 404);
    }

    return sendSuccess(res, {
      questionnaire,
    }, 'Questionário recuperado com sucesso');

  } catch (error) {
    next(error);
  }
};

/**
 * Update user questionnaire
 */
export const updateQuestionnaire = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = questionnaireUpdateSchema.validate(req.body);
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return sendError(res, 'Dados inválidos', 400, errors);
    }

    const userId = req.user.id;

    // Update questionnaire using service
    const updatedQuestionnaire = await QuestionnaireService.updateQuestionnaire(userId, value);

    return sendSuccess(res, {
      questionnaire: updatedQuestionnaire,
    }, 'Questionário atualizado com sucesso');

  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Delete user questionnaire
 */
export const deleteQuestionnaire = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Delete questionnaire using service
    await QuestionnaireService.deleteQuestionnaire(userId);

    return sendSuccess(res, {}, 'Questionário deletado com sucesso');

  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Check if user has questionnaire
 */
export const hasQuestionnaire = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check questionnaire existence using service
    const hasQuest = await QuestionnaireService.hasQuestionnaire(userId);

    return sendSuccess(res, {
      hasQuestionnaire: hasQuest,
    }, 'Status do questionário verificado com sucesso');

  } catch (error) {
    next(error);
  }
};

/**
 * Get questionnaire statistics (admin endpoint)
 */
export const getQuestionnaireStats = async (req, res, next) => {
  try {
    // Get statistics using service
    const stats = await QuestionnaireService.getQuestionnaireStats();

    return sendSuccess(res, {
      stats,
    }, 'Estatísticas do questionário recuperadas com sucesso');

  } catch (error) {
    next(error);
  }
};
