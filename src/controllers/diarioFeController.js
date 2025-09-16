/**
 * Diario Fe Controller
 * Handles HTTP requests and responses for faith diary management
 * Business logic is delegated to DiarioFeService
 */

import { DiarioFeService } from '../services/diarioFeService.js';
import { PDFService } from '../services/pdfService.js';
import { UserService } from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Create a new diary entry
 */
export const createEntry = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      titulo,
      conteudo,
      emocoes,
      versiculos,
      gratidao,
      oracoes,
      reflexoes,
      clima,
      privacidade,
      isFavorito,
    } = req.body;

    // Validate required fields
    if (!conteudo) {
      return sendError(res, 'Conteúdo é obrigatório', 400);
    }

    // Validate emotional climate if provided
    if (clima) {
      const validClimates = DiarioFeService.getEmotionalClimates();
      if (!validClimates.includes(clima)) {
        return sendError(res, 'Clima emocional inválido', 400);
      }
    }

    const entryData = {
      titulo,
      conteudo,
      emocoes: Array.isArray(emocoes) ? emocoes : [],
      versiculos: Array.isArray(versiculos) ? versiculos : [],
      gratidao: Array.isArray(gratidao) ? gratidao : [],
      oracoes: Array.isArray(oracoes) ? oracoes : [],
      reflexoes,
      clima,
      privacidade: privacidade || 'privada',
      isFavorito: isFavorito || false,
    };

    const entry = await DiarioFeService.createEntry(userId, entryData);

    return sendSuccess(res, { entry }, 'Entrada do diário criada com sucesso', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's diary entries with pagination and filters
 */
export const getUserEntries = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      clima,
      favoritos,
      search,
      startDate,
      endDate,
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      clima,
      favoritos: favoritos === 'true',
      search,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const result = await DiarioFeService.getUserEntries(userId, options);

    return sendSuccess(res, result, 'Entradas do diário recuperadas com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Get diary entry by ID
 */
export const getEntryById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const entry = await DiarioFeService.getEntryById(id, userId);

    if (!entry) {
      return sendError(res, 'Entrada do diário não encontrada', 404);
    }

    return sendSuccess(res, { entry }, 'Entrada do diário recuperada com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Update diary entry
 */
export const updateEntry = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    // Validate emotional climate if provided
    if (updateData.clima) {
      const validClimates = DiarioFeService.getEmotionalClimates();
      if (!validClimates.includes(updateData.clima)) {
        return sendError(res, 'Clima emocional inválido', 400);
      }
    }

    const entry = await DiarioFeService.updateEntry(id, userId, updateData);

    if (!entry) {
      return sendError(res, 'Entrada do diário não encontrada', 404);
    }

    return sendSuccess(res, { entry }, 'Entrada do diário atualizada com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete diary entry
 */
export const deleteEntry = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await DiarioFeService.deleteEntry(id, userId);

    if (!deleted) {
      return sendError(res, 'Entrada do diário não encontrada', 404);
    }

    return sendSuccess(res, null, 'Entrada do diário excluída com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle entry favorite status
 */
export const toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const entry = await DiarioFeService.toggleFavorite(id, userId);

    if (!entry) {
      return sendError(res, 'Entrada do diário não encontrada', 404);
    }

    return sendSuccess(res, { entry }, 'Status de favorita atualizado com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Get diary statistics
 */
export const getDiaryStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await DiarioFeService.getDiaryStats(userId);

    return sendSuccess(res, { stats }, 'Estatísticas do diário recuperadas com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Get entries for a specific date range (for analytics)
 */
export const getEntriesInDateRange = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return sendError(res, 'Data de início e fim são obrigatórias', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return sendError(res, 'Data de início deve ser anterior à data de fim', 400);
    }

    const entries = await DiarioFeService.getEntriesInDateRange(userId, start, end);

    return sendSuccess(res, { entries }, 'Entradas no período recuperadas com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Search entries by content
 */
export const searchEntries = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { q: searchTerm, limit } = req.query;

    if (!searchTerm) {
      return sendError(res, 'Termo de busca é obrigatório', 400);
    }

    const options = {
      limit: limit ? parseInt(limit) : 20,
    };

    const entries = await DiarioFeService.searchEntries(userId, searchTerm, options);

    return sendSuccess(res, { entries }, 'Busca realizada com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Get available emotional climates
 */
export const getEmotionalClimates = async (req, res, next) => {
  try {
    const climates = DiarioFeService.getEmotionalClimates();

    return sendSuccess(res, { climates }, 'Climas emocionais recuperados com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Get common emotions
 */
export const getCommonEmotions = async (req, res, next) => {
  try {
    const emotions = DiarioFeService.getCommonEmotions();

    return sendSuccess(res, { emotions }, 'Emoções comuns recuperadas com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Export diary entries to PDF
 */
export const exportDiaryPDF = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      clima,
      favoritos,
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
      limit: 1000, // Get all entries for export
      clima,
      favoritos: favoritos === 'true',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const result = await DiarioFeService.getUserEntries(userId, options);
    const entries = result.entries;

    if (entries.length === 0) {
      return sendError(res, 'Nenhuma entrada encontrada para exportar', 404);
    }

    // Generate PDF
    const pdfBuffer = await PDFService.generateDiaryPDF(entries, user);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="meu-diario-fe-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};