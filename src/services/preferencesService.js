/**
 * Preferences Service
 * Contains all database operations and business logic related to user preferences
 */

import prisma from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Get user preferences
 */
export async function getUserPreferences(userId) {
  try {
    const preferences = await prisma.preferences.findUnique({
      where: { userId }
    });

    return preferences;
  } catch (error) {
    logger.error('Error getting user preferences:', error);
    throw error;
  }
}

/**
 * Create user preferences
 */
export async function createUserPreferences(userId, preferencesData) {
  try {
    // Check if preferences already exist
    const existingPreferences = await prisma.preferences.findUnique({
      where: { userId }
    });

    if (existingPreferences) {
      throw new ValidationError('User preferences already exist. Use update instead.');
    }

    const preferences = await prisma.preferences.create({
      data: {
        userId,
        ...preferencesData
      }
    });

    logger.info(`Created preferences for user ${userId}`);
    return preferences;
  } catch (error) {
    logger.error('Error creating user preferences:', error);
    throw error;
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(userId, preferencesData) {
  try {
    // Try to update existing preferences
    const preferences = await prisma.preferences.upsert({
      where: { userId },
      create: {
        userId,
        ...preferencesData
      },
      update: preferencesData
    });

    logger.info(`Updated preferences for user ${userId}`);
    return preferences;
  } catch (error) {
    logger.error('Error updating user preferences:', error);
    throw error;
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(userId, notificationData) {
  try {
    // Validate notification data consistency
    if (notificationData.notificationEnabled && !notificationData.notificationType) {
      throw new ValidationError('Notification type is required when notifications are enabled');
    }

    if (notificationData.notificationType === 'weekly' && (!notificationData.notificationDays || notificationData.notificationDays.length === 0)) {
      throw new ValidationError('Notification days are required for weekly notifications');
    }

    const preferences = await prisma.preferences.upsert({
      where: { userId },
      create: {
        userId,
        ...notificationData
      },
      update: notificationData
    });

    logger.info(`Updated notification preferences for user ${userId}`);
    return preferences;
  } catch (error) {
    logger.error('Error updating notification preferences:', error);
    throw error;
  }
}

/**
 * Get user notification preferences
 */
export async function getUserNotificationPreferences(userId) {
  try {
    const preferences = await prisma.preferences.findUnique({
      where: { userId },
      select: {
        notificationEnabled: true,
        notificationType: true,
        notificationTime: true,
        notificationDays: true,
        updatedAt: true
      }
    });

    return preferences;
  } catch (error) {
    logger.error('Error getting user notification preferences:', error);
    throw error;
  }
}

/**
 * Get all users with enabled notifications for scheduling
 */
export async function getUsersWithEnabledNotifications() {
  try {
    const users = await prisma.preferences.findMany({
      where: {
        notificationEnabled: true,
        notificationType: { not: null },
        notificationTime: { not: null }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return users;
  } catch (error) {
    logger.error('Error getting users with enabled notifications:', error);
    throw error;
  }
}

/**
 * Get response tone preference for prompt building
 */
export async function getUserResponseTone(userId) {
  try {
    const preferences = await prisma.preferences.findUnique({
      where: { userId },
      select: { responseTone: true }
    });

    return preferences?.responseTone || 'detalhada'; // default
  } catch (error) {
    logger.error('Error getting user response tone:', error);
    // Return default on error to not break chat functionality
    return 'detalhada';
  }
}

/**
 * Delete user preferences
 */
export async function deleteUserPreferences(userId) {
  try {
    const preferences = await prisma.preferences.findUnique({
      where: { userId }
    });

    if (!preferences) {
      throw new NotFoundError('User preferences not found');
    }

    await prisma.preferences.delete({
      where: { userId }
    });

    logger.info(`Deleted preferences for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Error deleting user preferences:', error);
    throw error;
  }
}
