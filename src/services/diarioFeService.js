/**
 * Diario Fe Service
 * Contains all database operations and business logic related to faith diary management
 */

import prisma from '../config/database.js';

export class DiarioFeService {
  /**
   * Create a new diary entry
   * @param {string} userId - User's ID
   * @param {Object} entryData - Diary entry data
   * @param {string} [entryData.titulo] - Entry title
   * @param {string} entryData.conteudo - Entry content
   * @param {string[]} [entryData.emocoes] - Associated emotions
   * @param {string[]} [entryData.versiculos] - Referenced bible verses
   * @param {string[]} [entryData.gratidao] - Things grateful for
   * @param {string[]} [entryData.oracoes] - Prayer requests/prayers
   * @param {string} [entryData.reflexoes] - Personal reflections
   * @param {string} [entryData.clima] - Emotional climate
   * @param {string} [entryData.privacidade] - Privacy setting
   * @returns {Promise<Object>} Created diary entry
   */
  static async createEntry(userId, entryData) {
    const entry = await prisma.diarioFe.create({
      data: {
        userId,
        titulo: entryData.titulo,
        conteudo: entryData.conteudo,
        emocoes: entryData.emocoes || [],
        versiculos: entryData.versiculos || [],
        gratidao: entryData.gratidao || [],
        oracoes: entryData.oracoes || [],
        reflexoes: entryData.reflexoes,
        clima: entryData.clima,
        privacidade: entryData.privacidade || 'privada',
        isFavorito: entryData.isFavorito || false,
      },
    });

    return entry;
  }

  /**
   * Get user's diary entries with pagination and filters
   * @param {string} userId - User's ID
   * @param {Object} options - Query options
   * @param {number} [options.page] - Page number (default: 1)
   * @param {number} [options.limit] - Items per page (default: 10)
   * @param {string} [options.clima] - Filter by emotional climate
   * @param {boolean} [options.favoritos] - Filter favorites only
   * @param {string} [options.search] - Search in title and content
   * @param {Date} [options.startDate] - Filter from this date
   * @param {Date} [options.endDate] - Filter until this date
   * @returns {Promise<Object>} Paginated diary entries result
   */
  static async getUserEntries(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      clima,
      favoritos,
      search,
      startDate,
      endDate,
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      userId,
      ...(clima && { clima }),
      ...(favoritos && { isFavorito: true }),
      ...(search && {
        OR: [
          { titulo: { contains: search, mode: 'insensitive' } },
          { conteudo: { contains: search, mode: 'insensitive' } },
          { reflexoes: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(startDate && { createdAt: { gte: startDate } }),
      ...(endDate && { createdAt: { lte: endDate } }),
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const [entries, total] = await Promise.all([
      prisma.diarioFe.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.diarioFe.count({ where }),
    ]);

    return {
      entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get diary entry by ID
   * @param {string} entryId - Entry's ID
   * @param {string} userId - User's ID (for authorization)
   * @returns {Promise<Object|null>} Entry data or null if not found
   */
  static async getEntryById(entryId, userId) {
    const entry = await prisma.diarioFe.findFirst({
      where: {
        id: entryId,
        userId,
      },
    });

    return entry;
  }

  /**
   * Update diary entry
   * @param {string} entryId - Entry's ID
   * @param {string} userId - User's ID (for authorization)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated entry or null if not found
   */
  static async updateEntry(entryId, userId, updateData) {
    try {
      const entry = await prisma.diarioFe.update({
        where: {
          id: entryId,
          userId,
        },
        data: updateData,
      });

      return entry;
    } catch (error) {
      if (error.code === 'P2025') {
        // Record not found
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete diary entry
   * @param {string} entryId - Entry's ID
   * @param {string} userId - User's ID (for authorization)
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async deleteEntry(entryId, userId) {
    try {
      await prisma.diarioFe.delete({
        where: {
          id: entryId,
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
   * Toggle entry favorite status
   * @param {string} entryId - Entry's ID
   * @param {string} userId - User's ID (for authorization)
   * @returns {Promise<Object|null>} Updated entry or null if not found
   */
  static async toggleFavorite(entryId, userId) {
    try {
      // First get current status
      const currentEntry = await prisma.diarioFe.findFirst({
        where: { id: entryId, userId },
        select: { isFavorito: true },
      });

      if (!currentEntry) {
        return null;
      }

      // Toggle the favorite status
      const entry = await prisma.diarioFe.update({
        where: {
          id: entryId,
          userId,
        },
        data: {
          isFavorito: !currentEntry.isFavorito,
        },
      });

      return entry;
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get diary statistics for user
   * @param {string} userId - User's ID
   * @returns {Promise<Object>} Diary statistics
   */
  static async getDiaryStats(userId) {
    try {
      const [
        totalEntries,
        favoriteCount,
        climateStats,
        emotionStats,
        recentActivity,
        weeklyActivity,
        monthlyActivity,
        // Removendo a agregação problemática de _sum em arrays
      ] = await Promise.all([
        // Total de entradas
        this.prisma.diarioFe.count({
          where: { userId }
        }),

        // Entradas favoritas
        this.prisma.diarioFe.count({
          where: { userId, isFavorito: true }
        }),

        // Estatísticas por clima
        this.prisma.diarioFe.groupBy({
          by: ['clima'],
          where: { 
            userId,
            clima: { not: null }
          },
          _count: true,
          orderBy: { _count: { clima: 'desc' } }
        }),

        // Estatísticas por emoções (contagem manual)
        this.prisma.diarioFe.findMany({
          where: { userId },
          select: { emocoes: true }
        }),

        // Atividade recente (últimos 7 dias)
        this.prisma.diarioFe.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),

        // Atividade semanal (últimas 4 semanas)
        this.prisma.diarioFe.groupBy({
          by: ['createdAt'],
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
            }
          },
          _count: true
        }),

        // Atividade mensal (últimos 6 meses)
        this.prisma.diarioFe.groupBy({
          by: ['createdAt'],
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
            }
          },
          _count: true
        })
      ]);

      // Processar estatísticas de emoções manualmente
      const emotionCounts = {};
      emotionStats.forEach(entry => {
        entry.emocoes.forEach(emocao => {
          emotionCounts[emocao] = (emotionCounts[emocao] || 0) + 1;
        });
      });

      const topEmotions = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([emotion, count]) => ({ emotion, count }));

      // Processar dados de atividade semanal
      const weeklyData = this.processWeeklyActivity(weeklyActivity);
      const monthlyData = this.processMonthlyActivity(monthlyActivity);

      return {
        summary: {
          totalEntries,
          favoriteCount,
          favoritePercentage: totalEntries > 0 ? Math.round((favoriteCount / totalEntries) * 100) : 0,
          recentActivity
        },
        climateDistribution: climateStats.map(stat => ({
          clima: stat.clima,
          count: stat._count,
          percentage: totalEntries > 0 ? Math.round((stat._count / totalEntries) * 100) : 0
        })),
        topEmotions,
        activity: {
          weekly: weeklyData,
          monthly: monthlyData
        },
        insights: this.generateInsights({
          totalEntries,
          favoriteCount,
          recentActivity,
          topEmotions,
          climateStats
        })
      };

    } catch (error) {
      console.error('Error getting diary stats:', error);
      throw new Error('Erro ao obter estatísticas do diário');
    }
  }

  // Método auxiliar para processar atividade semanal
  static processWeeklyActivity(weeklyActivity) {
    const weeks = {};
    weeklyActivity.forEach(activity => {
      const week = this.getWeekKey(activity.createdAt);
      weeks[week] = (weeks[week] || 0) + activity._count;
    });
    
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, count]) => ({ week, count }));
  }

  // Método auxiliar para processar atividade mensal
  static processMonthlyActivity(monthlyActivity) {
    const months = {};
    monthlyActivity.forEach(activity => {
      const month = this.getMonthKey(activity.createdAt);
      months[month] = (months[month] || 0) + activity._count;
    });
    
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }

  // Método auxiliar para gerar insights
  static generateInsights(data) {
    const insights = [];
    
    if (data.recentActivity > 0) {
      insights.push(`Você tem mantido uma prática consistente com ${data.recentActivity} entradas na última semana.`);
    }
    
    if (data.favoriteCount > 0) {
      insights.push(`${data.favoriteCount} de suas entradas são especiais para você (favoritas).`);
    }
    
    if (data.topEmotions.length > 0) {
      const topEmotion = data.topEmotions[0];
      insights.push(`A emoção mais presente em suas reflexões é: ${topEmotion.emotion}.`);
    }
    
    return insights;
  }

  // Métodos auxiliares para formatação de data
  static getWeekKey(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const week = Math.ceil(((d - new Date(year, 0, 1)) / 86400000 + 1) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  static getMonthKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  /**
   * Get diary statistics for user
   * @param {string} userId - User's ID
   * @returns {Promise<Object>} Diary statistics
   */
  static async getDiaryStats(userId) {
    const [
      totalEntries,
      favoritesCount,
      climaStats,
      emotionsStats,
      recentEntries,
      entriesThisMonth,
      gratitudeCount,
      prayersCount,
    ] = await Promise.all([
      prisma.diarioFe.count({ where: { userId } }),
      prisma.diarioFe.count({ where: { userId, isFavorito: true } }),
      prisma.diarioFe.groupBy({
        by: ['clima'],
        where: { userId, clima: { not: null } },
        _count: true,
      }),
      // Get most frequent emotions
      prisma.diarioFe.findMany({
        where: { userId },
        select: { emocoes: true },
      }),
      prisma.diarioFe.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          titulo: true,
          clima: true,
          createdAt: true,
        },
      }),
      prisma.diarioFe.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.diarioFe.aggregate({
        where: { userId },
        _sum: {
          gratidao: true,
        },
      }),
      prisma.diarioFe.aggregate({
        where: { userId },
        _sum: {
          oracoes: true,
        },
      }),
    ]);

    // Process emotions to count frequency
    const allEmotions = emotionsStats.flatMap(entry => entry.emocoes);
    const emotionCounts = allEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});

    // Get top 5 emotions
    const topEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    return {
      totalEntries,
      favoritesCount,
      climaStats,
      topEmotions,
      recentEntries,
      entriesThisMonth,
      totalGratitudeItems: gratitudeCount._sum.gratidao?.length || 0,
      totalPrayerItems: prayersCount._sum.oracoes?.length || 0,
    };
  }

  /**
   * Get entries for a specific date range (for analytics)
   * @param {string} userId - User's ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Entries in date range
   */
  static async getEntriesInDateRange(userId, startDate, endDate) {
    const entries = await prisma.diarioFe.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        titulo: true,
        emocoes: true,
        clima: true,
        gratidao: true,
        createdAt: true,
      },
    });

    return entries;
  }

  /**
   * Search entries by content
   * @param {string} userId - User's ID
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @param {number} [options.limit] - Max results (default: 20)
   * @returns {Promise<Array>} Matching entries
   */
  static async searchEntries(userId, searchTerm, options = {}) {
    const { limit = 20 } = options;

    const entries = await prisma.diarioFe.findMany({
      where: {
        userId,
        OR: [
          { titulo: { contains: searchTerm, mode: 'insensitive' } },
          { conteudo: { contains: searchTerm, mode: 'insensitive' } },
          { reflexoes: { contains: searchTerm, mode: 'insensitive' } },
          { versiculos: { hasSome: [searchTerm] } },
          { gratidao: { hasSome: [searchTerm] } },
          { oracoes: { hasSome: [searchTerm] } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return entries;
  }

  /**
   * Get available emotional climates
   * @returns {Array<string>} Available climates
   */
  static getEmotionalClimates() {
    return [
      'paz',
      'alegria',
      'gratidao',
      'esperanca',
      'ansiedade',
      'tristeza',
      'confusao',
      'medo',
      'raiva',
      'solidao',
      'contentamento',
      'adoracao',
      'reflexao',
      'contemplacao'
    ];
  }

  /**
   * Get common emotions
   * @returns {Array<string>} Common emotions
   */
  static getCommonEmotions() {
    return [
      'alegria',
      'tristeza',
      'ansiedade',
      'paz',
      'gratidao',
      'esperanca',
      'medo',
      'amor',
      'raiva',
      'confusao',
      'fe',
      'duvida',
      'contentamento',
      'preocupacao',
      'serenidade'
    ];
  }
}