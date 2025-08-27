/**
 * User Service
 * Contains all database operations and business logic related to user management
 */

import prisma from '../config/database.js';

export class UserService {
  /**
   * Get user profile by ID
   * @param {string} userId - User's ID
   * @returns {Promise<Object|null>} User profile data or null if not found
   */
  static async getUserProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // Parse favorites JSON string if it exists
    if (user && user.favorites) {
      try {
        user.favorites = JSON.parse(user.favorites);
      } catch (error) {
        // If parsing fails, keep as string or set as empty array
        user.favorites = [];
      }
    } else if (user) {
      user.favorites = [];
    }

    return user;
  }

  /**
   * Update user profile
   * @param {string} userId - User's ID
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.name] - New name
   * @param {string} [updateData.avatar] - New avatar URL
   * @param {string} [updateData.favorites] - New favorites (JSON string)
   * @param {string} [updateData.responseStyle] - New response style
   * @returns {Promise<Object>} Updated user profile
   * @throws {Error} If user not found
   */
  static async updateUserProfile(userId, updateData) {
    try {
      // Filter out undefined values
      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          filteredData[key] = updateData[key];
        }
      });

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: filteredData,
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

      // Parse favorites JSON string if it exists
      if (updatedUser.favorites) {
        try {
          updatedUser.favorites = JSON.parse(updatedUser.favorites);
        } catch (error) {
          updatedUser.favorites = [];
        }
      } else {
        updatedUser.favorites = [];
      }

      return updatedUser;
    } catch (error) {
      if (error.code === 'P2025') {
        const notFoundError = new Error('Usuário não encontrado');
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      throw error;
    }
  }

  /**
   * Update user favorites
   * @param {string} userId - User's ID
   * @param {Array<string>} favorites - Array of favorite character names
   * @returns {Promise<Object>} Updated user profile
   */
  static async updateUserFavorites(userId, favorites) {
    const favoritesJson = JSON.stringify(favorites);
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { favorites: favoritesJson },
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

    // Parse the favorites back to array for response
    try {
      updatedUser.favorites = JSON.parse(updatedUser.favorites);
    } catch (error) {
      updatedUser.favorites = [];
    }

    return updatedUser;
  }

  /**
   * Update user response style
   * @param {string} userId - User's ID
   * @param {string} responseStyle - New response style (BREVE, DETALHADA, ESPIRITUAL, PRATICA)
   * @returns {Promise<Object>} Updated user profile
   */
  static async updateUserResponseStyle(userId, responseStyle) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { responseStyle },
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

    // Parse favorites JSON string if it exists
    if (updatedUser.favorites) {
      try {
        updatedUser.favorites = JSON.parse(updatedUser.favorites);
      } catch (error) {
        updatedUser.favorites = [];
      }
    } else {
      updatedUser.favorites = [];
    }

    return updatedUser;
  }

  /**
   * Check if user exists by ID
   * @param {string} userId - User's ID
   * @returns {Promise<boolean>} True if user exists, false otherwise
   */
  static async userExistsById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    return !!user;
  }

  /**
   * Get user statistics (for admin purposes)
   * @returns {Promise<Object>} User statistics
   */
  static async getUserStats() {
    const totalUsers = await prisma.user.count();
    
    const responseStyleStats = await prisma.user.groupBy({
      by: ['responseStyle'],
      _count: {
        responseStyle: true,
      },
    });

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    return {
      totalUsers,
      recentUsers,
      responseStyleDistribution: responseStyleStats.reduce((acc, curr) => {
        acc[curr.responseStyle] = curr._count.responseStyle;
        return acc;
      }, {}),
    };
  }
}