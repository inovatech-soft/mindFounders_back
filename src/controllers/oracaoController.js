/**
 * Oracao Controller
 * Handles HTTP requests and responses for prayer management
 * Business logic is delegated to OracaoService
 */

import { OracaoService } from '../services/oracaoService.js';
import { PDFService } from '../services/pdfService.js';
import { UserService } from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Create a new prayer
 */
export const createPrayer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { titulo, categoria, conteudo, emocoes, tempoGasto, privacidade, isFavorita } = req.body;

    // Validate required fields
    if (!titulo || !categoria || !conteudo) {
      return sendError(res, 'Título, categoria e conteúdo são obrigatórios', 400);
    }

    // Validate category
    const validCategories = OracaoService.getPrayerCategories();
    if (!validCategories.includes(categoria)) {
      return sendError(res, 'Categoria inválida', 400);
    }

    const prayerData = {
      titulo,
      categoria,
      conteudo,
      emocoes: Array.isArray(emocoes) ? emocoes : [],
      tempoGasto: tempoGasto ? parseInt(tempoGasto) : null,
      privacidade: privacidade || 'privada',
      isFavorita: isFavorita || false,
    };

    const prayer = await OracaoService.createPrayer(userId, prayerData);

    return sendSuccess(res, { prayer }, 'Oração criada com sucesso', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's prayers with pagination and filters
 */
export const getUserPrayers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      categoria,
      favoritas,
      search,
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      categoria,
      favoritas: favoritas === 'true',
      search,
    };

    const result = await OracaoService.getUserPrayers(userId, options);

    return sendSuccess(res, result, 'Orações recuperadas com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Get prayer by ID
 */
export const getPrayerById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const prayer = await OracaoService.getPrayerById(id, userId);

    if (!prayer) {
      return sendError(res, 'Oração não encontrada', 404);
    }

    return sendSuccess(res, { prayer }, 'Oração recuperada com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Update prayer
 */
export const updatePrayer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    // Validate category if provided
    if (updateData.categoria) {
      const validCategories = OracaoService.getPrayerCategories();
      if (!validCategories.includes(updateData.categoria)) {
        return sendError(res, 'Categoria inválida', 400);
      }
    }

    // Process tempoGasto if provided
    if (updateData.tempoGasto !== undefined) {
      updateData.tempoGasto = parseInt(updateData.tempoGasto) || null;
    }

    const prayer = await OracaoService.updatePrayer(id, userId, updateData);

    if (!prayer) {
      return sendError(res, 'Oração não encontrada', 404);
    }

    return sendSuccess(res, { prayer }, 'Oração atualizada com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete prayer
 */
export const deletePrayer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await OracaoService.deletePrayer(id, userId);

    if (!deleted) {
      return sendError(res, 'Oração não encontrada', 404);
    }

    return sendSuccess(res, null, 'Oração excluída com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle prayer favorite status
 */
export const toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const prayer = await OracaoService.toggleFavorite(id, userId);

    if (!prayer) {
      return sendError(res, 'Oração não encontrada', 404);
    }

    return sendSuccess(res, { prayer }, 'Status de favorita atualizado com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Get prayer statistics
 */
export const getPrayerStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await OracaoService.getPrayerStats(userId);

    return sendSuccess(res, { stats }, 'Estatísticas de oração recuperadas com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Get available prayer categories
 */
export const getPrayerCategories = async (req, res, next) => {
  try {
    const categories = OracaoService.getPrayerCategories();

    return sendSuccess(res, { categories }, 'Categorias de oração recuperadas com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Export prayers to PDF
 */
export const exportPrayersPDF = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      categoria,
      favoritas,
      startDate,
      endDate,
    } = req.query;

    // Get user info
    const user = await UserService.getUserProfile(userId);
    if (!user) {
      return sendError(res, 'Usuário não encontrado', 404);
    }

    // Build filter options
    const options = {
      page: 1,
      limit: 1000, // Get all prayers for export
      categoria,
      favoritas: favoritas === 'true',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const result = await OracaoService.getUserPrayers(userId, options);
    const prayers = result.prayers;

    if (prayers.length === 0) {
      return sendError(res, 'Nenhuma oração encontrada para exportar', 404);
    }

    // Generate PDF
    const pdfBuffer = await PDFService.generatePrayerPDF(prayers, user);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="minhas-oracoes-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};