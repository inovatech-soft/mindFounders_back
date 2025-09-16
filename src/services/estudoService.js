/**
 * Estudo Tematico Service
 * Contains all database operations and business logic related to thematic studies management
 */

import prisma from '../config/database.js';

export class EstudoService {
  /**
   * Get all available studies
   * @param {Object} options - Query options
   * @param {string} [options.categoria] - Filter by category
   * @param {number} [options.page] - Page number (default: 1)
   * @param {number} [options.limit] - Items per page (default: 10)
   * @returns {Promise<Object>} Studies with pagination
   */
  static async getAllStudies(options = {}) {
    const {
      categoria,
      page = 1,
      limit = 10,
    } = options;

    const skip = (page - 1) * limit;

    const where = {
      ...(categoria && { categoria }),
    };

    const [studies, total] = await Promise.all([
      prisma.estudoTematico.findMany({
        where,
        include: {
          sessoes: {
            orderBy: { numero: 'asc' },
            select: {
              id: true,
              numero: true,
              titulo: true,
            },
          },
          _count: {
            select: {
              participacoes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.estudoTematico.count({ where }),
    ]);

    return {
      studies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get study by ID with sessions
   * @param {string} studyId - Study's ID
   * @returns {Promise<Object|null>} Study data with sessions or null if not found
   */
  static async getStudyById(studyId) {
    const study = await prisma.estudoTematico.findUnique({
      where: { id: studyId },
      include: {
        sessoes: {
          orderBy: { numero: 'asc' },
        },
        _count: {
          select: {
            participacoes: true,
          },
        },
      },
    });

    return study;
  }

  /**
   * Start user participation in a study
   * @param {string} userId - User's ID
   * @param {string} studyId - Study's ID
   * @returns {Promise<Object>} Created participation
   */
  static async startStudyParticipation(userId, studyId) {
    // Check if study exists
    const study = await prisma.estudoTematico.findUnique({
      where: { id: studyId },
    });

    if (!study) {
      throw new Error('Study not found');
    }

    // Check if user is already participating
    const existingParticipation = await prisma.participacaoEstudo.findUnique({
      where: {
        userId_estudoId: {
          userId,
          estudoId: studyId,
        },
      },
    });

    if (existingParticipation) {
      throw new Error('User is already participating in this study');
    }

    const participation = await prisma.participacaoEstudo.create({
      data: {
        userId,
        estudoId: studyId,
        sessaoAtual: 1,
        progresso: 0.0,
      },
      include: {
        estudo: {
          include: {
            sessoes: {
              orderBy: { numero: 'asc' },
            },
          },
        },
      },
    });

    return participation;
  }

  /**
   * Get user's study participation
   * @param {string} userId - User's ID
   * @param {string} studyId - Study's ID
   * @returns {Promise<Object|null>} Participation data or null if not found
   */
  static async getUserParticipation(userId, studyId) {
    const participation = await prisma.participacaoEstudo.findUnique({
      where: {
        userId_estudoId: {
          userId,
          estudoId: studyId,
        },
      },
      include: {
        estudo: {
          include: {
            sessoes: {
              orderBy: { numero: 'asc' },
            },
          },
        },
      },
    });

    return participation;
  }

  /**
   * Get all user's study participations
   * @param {string} userId - User's ID
   * @param {Object} options - Query options
   * @param {string} [options.status] - Filter by status ('ativo', 'finalizado')
   * @returns {Promise<Array>} User's participations
   */
  static async getUserParticipations(userId, options = {}) {
    const { status } = options;

    const where = {
      userId,
      ...(status === 'finalizado' && { finalizadoEm: { not: null } }),
      ...(status === 'ativo' && { finalizadoEm: null }),
    };

    const participations = await prisma.participacaoEstudo.findMany({
      where,
      include: {
        estudo: {
          select: {
            id: true,
            titulo: true,
            categoria: true,
            tempoEstimado: true,
          },
        },
      },
      orderBy: { iniciadoEm: 'desc' },
    });

    return participations;
  }

  /**
   * Update user's progress in a study session
   * @param {string} userId - User's ID
   * @param {string} studyId - Study's ID
   * @param {Object} progressData - Progress data
   * @param {number} progressData.sessaoAtual - Current session number
   * @param {Object} [progressData.respostasUsuario] - User's answers
   * @returns {Promise<Object|null>} Updated participation or null if not found
   */
  static async updateStudyProgress(userId, studyId, progressData) {
    try {
      // Get the study to calculate progress
      const study = await prisma.estudoTematico.findUnique({
        where: { id: studyId },
        include: {
          sessoes: true,
        },
      });

      if (!study) {
        throw new Error('Study not found');
      }

      const totalSessions = study.sessoes.length;
      const currentSession = progressData.sessaoAtual;
      const newProgress = Math.min((currentSession / totalSessions) * 100, 100);
      
      // Check if study is completed
      const isCompleted = currentSession >= totalSessions;

      const participation = await prisma.participacaoEstudo.update({
        where: {
          userId_estudoId: {
            userId,
            estudoId: studyId,
          },
        },
        data: {
          sessaoAtual: currentSession,
          progresso: newProgress,
          respostasUsuario: progressData.respostasUsuario,
          ...(isCompleted && { finalizadoEm: new Date() }),
        },
        include: {
          estudo: {
            include: {
              sessoes: {
                orderBy: { numero: 'asc' },
              },
            },
          },
        },
      });

      return participation;
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get specific session content
   * @param {string} studyId - Study's ID
   * @param {number} sessionNumber - Session number
   * @returns {Promise<Object|null>} Session data or null if not found
   */
  static async getSessionContent(studyId, sessionNumber) {
    const session = await prisma.sessionEstudo.findFirst({
      where: {
        estudoId: studyId,
        numero: sessionNumber,
      },
    });

    return session;
  }

  /**
   * Get user's study statistics
   * @param {string} userId - User's ID
   * @returns {Promise<Object>} Study statistics
   */
  static async getUserStudyStats(userId) {
    const [
      totalParticipations,
      completedStudies,
      activeStudies,
      categoriesStats,
    ] = await Promise.all([
      prisma.participacaoEstudo.count({ where: { userId } }),
      prisma.participacaoEstudo.count({
        where: { userId, finalizadoEm: { not: null } },
      }),
      prisma.participacaoEstudo.count({
        where: { userId, finalizadoEm: null },
      }),
      prisma.participacaoEstudo.findMany({
        where: { userId },
        include: {
          estudo: {
            select: {
              categoria: true,
            },
          },
        },
      }),
    ]);

    // Count by categories
    const categoriesCounted = categoriesStats.reduce((acc, participation) => {
      const categoria = participation.estudo.categoria;
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});

    return {
      totalParticipations,
      completedStudies,
      activeStudies,
      categoriesStats: categoriesCounted,
    };
  }

  /**
   * Create a new study (admin function)
   * @param {Object} studyData - Study data
   * @param {string} studyData.titulo - Study title
   * @param {string} studyData.descricao - Study description
   * @param {string} studyData.categoria - Study category
   * @param {number} studyData.tempoEstimado - Estimated time in minutes
   * @param {Array} studyData.sessoes - Study sessions
   * @returns {Promise<Object>} Created study
   */
  static async createStudy(studyData) {
    const study = await prisma.estudoTematico.create({
      data: {
        titulo: studyData.titulo,
        descricao: studyData.descricao,
        categoria: studyData.categoria,
        tempoEstimado: studyData.tempoEstimado,
        sessoes: {
          create: studyData.sessoes.map((sessao, index) => ({
            numero: index + 1,
            titulo: sessao.titulo,
            conteudo: sessao.conteudo,
            versiculo: sessao.versiculo,
            reflexao: sessao.reflexao,
          })),
        },
      },
      include: {
        sessoes: {
          orderBy: { numero: 'asc' },
        },
      },
    });

    return study;
  }

  /**
   * Get available study categories
   * @returns {Array<string>} Available categories
   */
  static getStudyCategories() {
    return [
      'fe',
      'sabedoria',
      'amor',
      'perda',
      'proposito',
      'esperanca',
      'perdao',
      'gratidao',
      'oração',
      'familia'
    ];
  }
}