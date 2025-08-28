/**
 * Questionnaire Service
 * Handles all business logic and database operations related to questionnaires
 */

import prisma from '../config/database.js';

export class QuestionnaireService {
  /**
   * Create a new questionnaire for a user
   * @param {string} userId - User ID
   * @param {Object} questionnaireData - Questionnaire data
   * @returns {Promise<Object>} Created questionnaire
   */
  static async createQuestionnaire(userId, questionnaireData) {
    // Check if user already has a questionnaire
    const existingQuestionnaire = await prisma.questionnaire.findUnique({
      where: { userId },
    });

    if (existingQuestionnaire) {
      const error = new Error('Usuário já possui um questionário respondido');
      error.statusCode = 400;
      throw error;
    }

    // Verify if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error = new Error('Usuário não encontrado');
      error.statusCode = 404;
      throw error;
    }

    try {
      // Create questionnaire
      const questionnaire = await prisma.questionnaire.create({
        data: {
          ...questionnaireData,
          userId,
        },
        select: {
          id: true,
          userId: true,
          ageRange: true,
          currentSituation: true,
          anxietyFrequency: true,
          sadnessHandling: true,
          socialLife: true,
          loveRelationships: true,
          workFeeling: true,
          motivation: true,
          routine: true,
          sleep: true,
          selfKnowledgeGoal: true,
          values: true,
          challenge: true,
          childhoodInfluence: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return questionnaire;
    } catch (error) {
      console.error('Error creating questionnaire:', error);
      
      if (error.code === 'P2002') {
        const customError = new Error('Usuário já possui um questionário respondido');
        customError.statusCode = 400;
        throw customError;
      }
      
      throw error;
    }
  }

  /**
   * Get questionnaire by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User questionnaire or null
   */
  static async getQuestionnaireByUserId(userId) {
    try {
      const questionnaire = await prisma.questionnaire.findUnique({
        where: { userId },
        select: {
          id: true,
          userId: true,
          ageRange: true,
          currentSituation: true,
          anxietyFrequency: true,
          sadnessHandling: true,
          socialLife: true,
          loveRelationships: true,
          workFeeling: true,
          motivation: true,
          routine: true,
          sleep: true,
          selfKnowledgeGoal: true,
          values: true,
          challenge: true,
          childhoodInfluence: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return questionnaire;
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      throw error;
    }
  }

  /**
   * Update questionnaire for a user
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated questionnaire
   */
  static async updateQuestionnaire(userId, updateData) {
    // Check if questionnaire exists
    const existingQuestionnaire = await prisma.questionnaire.findUnique({
      where: { userId },
    });

    if (!existingQuestionnaire) {
      const error = new Error('Questionário não encontrado. Crie um questionário primeiro.');
      error.statusCode = 404;
      throw error;
    }

    try {
      // Filter out undefined values
      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          filteredData[key] = updateData[key];
        }
      });

      // Update questionnaire
      const updatedQuestionnaire = await prisma.questionnaire.update({
        where: { userId },
        data: filteredData,
        select: {
          id: true,
          userId: true,
          ageRange: true,
          currentSituation: true,
          anxietyFrequency: true,
          sadnessHandling: true,
          socialLife: true,
          loveRelationships: true,
          workFeeling: true,
          motivation: true,
          routine: true,
          sleep: true,
          selfKnowledgeGoal: true,
          values: true,
          challenge: true,
          childhoodInfluence: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return updatedQuestionnaire;
    } catch (error) {
      console.error('Error updating questionnaire:', error);
      throw error;
    }
  }

  /**
   * Delete questionnaire by user ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Deletion result
   */
  static async deleteQuestionnaire(userId) {
    try {
      const questionnaire = await prisma.questionnaire.findUnique({
        where: { userId },
      });

      if (!questionnaire) {
        const error = new Error('Questionário não encontrado');
        error.statusCode = 404;
        throw error;
      }

      await prisma.questionnaire.delete({
        where: { userId },
      });

      return true;
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
      throw error;
    }
  }

  /**
   * Check if user has completed questionnaire
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Whether user has questionnaire
   */
  static async hasQuestionnaire(userId) {
    try {
      const questionnaire = await prisma.questionnaire.findUnique({
        where: { userId },
        select: { id: true },
      });

      return !!questionnaire;
    } catch (error) {
      console.error('Error checking questionnaire existence:', error);
      throw error;
    }
  }

  /**
   * Get questionnaire statistics (for admin/analytics)
   * @returns {Promise<Object>} Statistics
   */
  static async getQuestionnaireStats() {
    try {
      const totalQuestionnaires = await prisma.questionnaire.count();
      
      // Get some basic aggregations
      const ageRangeStats = await prisma.questionnaire.groupBy({
        by: ['ageRange'],
        _count: {
          ageRange: true,
        },
      });

      const anxietyStats = await prisma.questionnaire.groupBy({
        by: ['anxietyFrequency'],
        _count: {
          anxietyFrequency: true,
        },
      });

      return {
        totalQuestionnaires,
        ageRangeDistribution: ageRangeStats,
        anxietyFrequencyDistribution: anxietyStats,
      };
    } catch (error) {
      console.error('Error fetching questionnaire stats:', error);
      throw error;
    }
  }
}
