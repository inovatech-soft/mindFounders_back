/**
 * Oracao Service
 * Contains all database operations and business logic related to prayer management
 */

import prisma from '../config/database.js';

export class OracaoService {
  /**
   * Create a new prayer
   * @param {string} userId - User's ID
   * @param {Object} prayerData - Prayer data
   * @param {string} prayerData.titulo - Prayer title
   * @param {string} prayerData.categoria - Prayer category
   * @param {string} prayerData.conteudo - Prayer content
   * @param {string[]} [prayerData.emocoes] - Associated emotions
   * @param {number} [prayerData.tempoGasto] - Time spent in minutes
   * @param {string} [prayerData.privacidade] - Privacy setting
   * @returns {Promise<Object>} Created prayer
   */
  static async createPrayer(userId, prayerData) {
    const prayer = await prisma.oracao.create({
      data: {
        userId,
        titulo: prayerData.titulo,
        categoria: prayerData.categoria,
        conteudo: prayerData.conteudo,
        emocoes: prayerData.emocoes || [],
        tempoGasto: prayerData.tempoGasto,
        privacidade: prayerData.privacidade || 'privada',
        isFavorita: prayerData.isFavorita || false,
      },
    });

    return prayer;
  }

  /**
   * Get user's prayers with pagination and filters
   * @param {string} userId - User's ID
   * @param {Object} options - Query options
   * @param {number} [options.page] - Page number (default: 1)
   * @param {number} [options.limit] - Items per page (default: 10)
   * @param {string} [options.categoria] - Filter by category
   * @param {boolean} [options.favoritas] - Filter favorites only
   * @param {string} [options.search] - Search in title and content
   * @returns {Promise<Object>} Paginated prayers result
   */
  static async getUserPrayers(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      categoria,
      favoritas,
      search,
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      userId,
      ...(categoria && { categoria }),
      ...(favoritas && { isFavorita: true }),
      ...(search && {
        OR: [
          { titulo: { contains: search, mode: 'insensitive' } },
          { conteudo: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [prayers, total] = await Promise.all([
      prisma.oracao.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.oracao.count({ where }),
    ]);

    return {
      prayers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get prayer by ID
   * @param {string} prayerId - Prayer's ID
   * @param {string} userId - User's ID (for authorization)
   * @returns {Promise<Object|null>} Prayer data or null if not found
   */
  static async getPrayerById(prayerId, userId) {
    const prayer = await prisma.oracao.findFirst({
      where: {
        id: prayerId,
        userId,
      },
    });

    return prayer;
  }

  /**
   * Update prayer
   * @param {string} prayerId - Prayer's ID
   * @param {string} userId - User's ID (for authorization)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated prayer or null if not found
   */
  static async updatePrayer(prayerId, userId, updateData) {
    try {
      const prayer = await prisma.oracao.update({
        where: {
          id: prayerId,
          userId,
        },
        data: updateData,
      });

      return prayer;
    } catch (error) {
      if (error.code === 'P2025') {
        // Record not found
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete prayer
   * @param {string} prayerId - Prayer's ID
   * @param {string} userId - User's ID (for authorization)
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async deletePrayer(prayerId, userId) {
    try {
      await prisma.oracao.delete({
        where: {
          id: prayerId,
          userId,
        },
      });

      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        // Record not found
        return false;
      }
      throw error;
    }
  }

  /**
   * Toggle prayer favorite status
   * @param {string} prayerId - Prayer's ID
   * @param {string} userId - User's ID (for authorization)
   * @returns {Promise<Object|null>} Updated prayer or null if not found
   */
  static async toggleFavorite(prayerId, userId) {
    try {
      // First get current status
      const currentPrayer = await prisma.oracao.findFirst({
        where: { id: prayerId, userId },
        select: { isFavorita: true },
      });

      if (!currentPrayer) {
        return null;
      }

      // Toggle the favorite status
      const prayer = await prisma.oracao.update({
        where: {
          id: prayerId,
          userId,
        },
        data: {
          isFavorita: !currentPrayer.isFavorita,
        },
      });

      return prayer;
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get prayer statistics for user
   * @param {string} userId - User's ID
   * @returns {Promise<Object>} Prayer statistics
   */
  static async getPrayerStats(userId) {
    try {
      const [
        totalPrayers,
        favoriteCount,
        categoryStats,
        recentActivity,
        // Corrigindo possíveis agregações problemáticas
        timeSpentData
      ] = await Promise.all([
        // Total de orações
        this.prisma.oracao.count({
          where: { userId }
        }),

        // Orações favoritas
        this.prisma.oracao.count({
          where: { userId, isFavorita: true }
        }),

        // Estatísticas por categoria
        this.prisma.oracao.groupBy({
          by: ['categoria'],
          where: { userId },
          _count: true,
          orderBy: { _count: { categoria: 'desc' } }
        }),

        // Atividade recente
        this.prisma.oracao.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),

        // Tempo gasto (apenas orações que têm tempoGasto)
        this.prisma.oracao.findMany({
          where: { 
            userId,
            tempoGasto: { not: null }
          },
          select: { tempoGasto: true }
        })
      ]);

      // Calcular tempo total manualmente
      const totalTimeSpent = timeSpentData.reduce((sum, prayer) => {
        return sum + (prayer.tempoGasto || 0);
      }, 0);

      const averageTimeSpent = timeSpentData.length > 0 
        ? Math.round(totalTimeSpent / timeSpentData.length) 
        : 0;

      return {
        summary: {
          totalPrayers,
          favoriteCount,
          favoritePercentage: totalPrayers > 0 ? Math.round((favoriteCount / totalPrayers) * 100) : 0,
          recentActivity,
          totalTimeSpent,
          averageTimeSpent
        },
        categoryDistribution: categoryStats.map(stat => ({
          categoria: stat.categoria,
          count: stat._count,
          percentage: totalPrayers > 0 ? Math.round((stat._count / totalPrayers) * 100) : 0
        })),
        insights: this.generatePrayerInsights({
          totalPrayers,
          favoriteCount,
          recentActivity,
          totalTimeSpent,
          averageTimeSpent,
          categoryStats
        })
      };

    } catch (error) {
      console.error('Error getting prayer stats:', error);
      throw new Error('Erro ao obter estatísticas de oração');
    }
  }

  generatePrayerInsights(data) {
    const insights = [];
    
    if (data.recentActivity > 0) {
      insights.push(`Você orou ${data.recentActivity} vezes na última semana.`);
    }
    
    if (data.totalTimeSpent > 0) {
      insights.push(`Você dedicou ${data.totalTimeSpent} minutos em oração.`);
    }
    
    if (data.categoryStats.length > 0) {
      const topCategory = data.categoryStats[0];
      insights.push(`Sua categoria de oração mais frequente é: ${topCategory.categoria}.`);
    }
    
    return insights;
  }

  /**
   * Get available prayer categories
   * @returns {Array<string>} Available categories
   */
  static getPrayerCategories() {
    return [
      'gratidao',
      'pedido',
      'intercession',
      'contemplation',
      'confissao',
      'louvor',
      'adoracao',
      'petição'
    ];
  }
}