/**
 * Estudo Controller
 * Handles HTTP requests and responses for thematic studies management
 * Business logic is delegated to EstudoService
 */

import { EstudoService } from '../services/estudoService.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Get all available studies
 */
export const getAllStudies = async (req, res, next) => {
  try {
    const {
      categoria,
      page = 1,
      limit = 10,
    } = req.query;

    const options = {
      categoria,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await EstudoService.getAllStudies(options);

    return sendSuccess(res, result, 'Estudos recuperados com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Get study by ID with sessions
 */
export const getStudyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const study = await EstudoService.getStudyById(id);

    if (!study) {
      return sendError(res, 'Estudo não encontrado', 404);
    }

    return sendSuccess(res, { study }, 'Estudo recuperado com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Start user participation in a study
 */
export const startStudyParticipation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      const participation = await EstudoService.startStudyParticipation(userId, id);

      return sendSuccess(res, { participation }, 'Participação no estudo iniciada com sucesso', 201);
    } catch (serviceError) {
      if (serviceError.message === 'Study not found') {
        return sendError(res, 'Estudo não encontrado', 404);
      }
      if (serviceError.message === 'User is already participating in this study') {
        return sendError(res, 'Usuário já está participando deste estudo', 409);
      }
      throw serviceError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's study participation
 */
export const getUserParticipation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const participation = await EstudoService.getUserParticipation(userId, id);

    if (!participation) {
      return sendError(res, 'Participação não encontrada', 404);
    }

    return sendSuccess(res, { participation }, 'Participação recuperada com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all user's study participations
 */
export const getUserParticipations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const options = { status };

    const participations = await EstudoService.getUserParticipations(userId, options);

    return sendSuccess(res, { participations }, 'Participações recuperadas com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user's progress in a study session
 */
export const updateStudyProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { sessaoAtual, respostasUsuario } = req.body;

    if (!sessaoAtual || sessaoAtual < 1) {
      return sendError(res, 'Número da sessão deve ser maior que 0', 400);
    }

    const progressData = {
      sessaoAtual: parseInt(sessaoAtual),
      respostasUsuario,
    };

    try {
      const participation = await EstudoService.updateStudyProgress(userId, id, progressData);

      if (!participation) {
        return sendError(res, 'Participação não encontrada', 404);
      }

      return sendSuccess(res, { participation }, 'Progresso atualizado com sucesso');
    } catch (serviceError) {
      if (serviceError.message === 'Study not found') {
        return sendError(res, 'Estudo não encontrado', 404);
      }
      throw serviceError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific session content
 */
export const getSessionContent = async (req, res, next) => {
  try {
    const { id, sessionNumber } = req.params;

    if (!sessionNumber || sessionNumber < 1) {
      return sendError(res, 'Número da sessão inválido', 400);
    }

    const session = await EstudoService.getSessionContent(id, parseInt(sessionNumber));

    if (!session) {
      return sendError(res, 'Sessão não encontrada', 404);
    }

    return sendSuccess(res, { session }, 'Sessão recuperada com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's study statistics
 */
export const getUserStudyStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await EstudoService.getUserStudyStats(userId);

    return sendSuccess(res, { stats }, 'Estatísticas de estudos recuperadas com sucesso');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new study (admin function)
 */
export const createStudy = async (req, res, next) => {
  try {
    const { titulo, descricao, categoria, tempoEstimado, sessoes } = req.body;

    // Validate required fields
    if (!titulo || !descricao || !categoria || !tempoEstimado || !sessoes) {
      return sendError(res, 'Todos os campos são obrigatórios', 400);
    }

    // Validate sessions
    if (!Array.isArray(sessoes) || sessoes.length === 0) {
      return sendError(res, 'Pelo menos uma sessão é obrigatória', 400);
    }

    // Validate category
    const validCategories = EstudoService.getStudyCategories();
    if (!validCategories.includes(categoria)) {
      return sendError(res, 'Categoria inválida', 400);
    }

    // Validate each session
    for (const sessao of sessoes) {
      if (!sessao.titulo || !sessao.conteudo || !sessao.reflexao) {
        return sendError(res, 'Cada sessão deve ter título, conteúdo e reflexão', 400);
      }
    }

    const studyData = {
      titulo,
      descricao,
      categoria,
      tempoEstimado: parseInt(tempoEstimado),
      sessoes,
    };

    const study = await EstudoService.createStudy(studyData);

    return sendSuccess(res, { study }, 'Estudo criado com sucesso', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get available study categories
 */
export const getStudyCategories = async (req, res, next) => {
  try {
    const categories = EstudoService.getStudyCategories();

    return sendSuccess(res, { categories }, 'Categorias de estudos recuperadas com sucesso');
  } catch (error) {
    next(error);
  }
};