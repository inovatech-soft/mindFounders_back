import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { sendError } from '../utils/response.js';
import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/database.js';

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request object
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return sendError(res, 'Token de acesso é obrigatório', 401);
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        favorites: true,
        responseStyle: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return sendError(res, 'Usuário não encontrado', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Token inválido', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expirado', 401);
    }
    
    console.error('Auth middleware error:', error);
    return sendError(res, 'Erro na autenticação', 500);
  }
};
