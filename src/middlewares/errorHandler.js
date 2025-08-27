import { sendError } from '../utils/response.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (error, req, res, next) => {
  console.error('Global error:', error);

  // Prisma specific errors
  if (error.code === 'P2002') {
    return sendError(res, 'Este email já está em uso', 409);
  }

  if (error.code === 'P2025') {
    return sendError(res, 'Registro não encontrado', 404);
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.details).map(detail => detail.message);
    return sendError(res, 'Dados inválidos', 400, errors);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return sendError(res, 'Token inválido', 401);
  }

  if (error.name === 'TokenExpiredError') {
    return sendError(res, 'Token expirado', 401);
  }

  // Default error response
  return sendError(res, 'Erro interno do servidor', 500);
};

/**
 * 404 Not Found middleware
 */
export const notFoundHandler = (req, res) => {
  return sendError(res, `Rota ${req.method} ${req.path} não encontrada`, 404);
};
