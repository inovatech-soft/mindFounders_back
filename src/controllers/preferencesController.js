/**
 * Preferences Controller
 * Handles HTTP requests for user preferences management
 */

import {
  getUserPreferences,
  createUserPreferences,
  updateUserPreferences,
  updateNotificationPreferences,
  getUserNotificationPreferences,
  deleteUserPreferences
} from '../services/preferencesService.js';
import { createSuccessResponse, createErrorResponse } from '../utils/response.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Get user preferences
 */
export async function getPreferences(req, res) {
  try {
    const userId = req.user.id;
    
    const preferences = await getUserPreferences(userId);
    
    if (!preferences) {
      // Return default preferences if none exist
      return res.json(createSuccessResponse(
        'Default preferences returned',
        {
          preferences: {
            responseTone: 'detalhada',
            notificationEnabled: false,
            notificationType: null,
            notificationTime: null,
            notificationDays: []
          }
        }
      ));
    }

    res.json(createSuccessResponse(
      'Preferences retrieved successfully',
      { preferences }
    ));
  } catch (error) {
    logger.error('Error in getPreferences:', error);
    res.status(500).json(createErrorResponse(
      'Failed to get preferences',
      'PREFERENCES_GET_ERROR'
    ));
  }
}

/**
 * Create user preferences
 */
export async function createPreferences(req, res) {
  try {
    const userId = req.user.id;
    const preferencesData = req.body;

    const preferences = await createUserPreferences(userId, preferencesData);

    res.status(201).json(createSuccessResponse(
      'Preferences created successfully',
      { preferences }
    ));
  } catch (error) {
    logger.error('Error in createPreferences:', error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json(createErrorResponse(
        error.message,
        'PREFERENCES_VALIDATION_ERROR'
      ));
    }

    res.status(500).json(createErrorResponse(
      'Failed to create preferences',
      'PREFERENCES_CREATE_ERROR'
    ));
  }
}

/**
 * Update user preferences
 */
export async function updatePreferences(req, res) {
  try {
    const userId = req.user.id;
    const preferencesData = req.body;

    const preferences = await updateUserPreferences(userId, preferencesData);

    res.json(createSuccessResponse(
      'Preferences updated successfully',
      { preferences }
    ));
  } catch (error) {
    logger.error('Error in updatePreferences:', error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json(createErrorResponse(
        error.message,
        'PREFERENCES_VALIDATION_ERROR'
      ));
    }

    res.status(500).json(createErrorResponse(
      'Failed to update preferences',
      'PREFERENCES_UPDATE_ERROR'
    ));
  }
}

/**
 * Update notification preferences
 */
export async function updateNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notificationData = req.body;

    const preferences = await updateNotificationPreferences(userId, notificationData);

    res.json(createSuccessResponse(
      'Notification preferences updated successfully',
      { 
        notifications: {
          notificationEnabled: preferences.notificationEnabled,
          notificationType: preferences.notificationType,
          notificationTime: preferences.notificationTime,
          notificationDays: preferences.notificationDays
        }
      }
    ));
  } catch (error) {
    logger.error('Error in updateNotifications:', error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json(createErrorResponse(
        error.message,
        'NOTIFICATION_VALIDATION_ERROR'
      ));
    }

    res.status(500).json(createErrorResponse(
      'Failed to update notification preferences',
      'NOTIFICATION_UPDATE_ERROR'
    ));
  }
}

/**
 * Get notification preferences
 */
export async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    
    const notifications = await getUserNotificationPreferences(userId);
    
    if (!notifications) {
      // Return default notification settings
      return res.json(createSuccessResponse(
        'Default notification settings returned',
        {
          notifications: {
            notificationEnabled: false,
            notificationType: null,
            notificationTime: null,
            notificationDays: []
          }
        }
      ));
    }

    res.json(createSuccessResponse(
      'Notification preferences retrieved successfully',
      { notifications }
    ));
  } catch (error) {
    logger.error('Error in getNotifications:', error);
    res.status(500).json(createErrorResponse(
      'Failed to get notification preferences',
      'NOTIFICATION_GET_ERROR'
    ));
  }
}

/**
 * Delete user preferences
 */
export async function deletePreferences(req, res) {
  try {
    const userId = req.user.id;

    await deleteUserPreferences(userId);

    res.json(createSuccessResponse(
      'Preferences deleted successfully'
    ));
  } catch (error) {
    logger.error('Error in deletePreferences:', error);
    
    if (error instanceof NotFoundError) {
      return res.status(404).json(createErrorResponse(
        error.message,
        'PREFERENCES_NOT_FOUND'
      ));
    }

    res.status(500).json(createErrorResponse(
      'Failed to delete preferences',
      'PREFERENCES_DELETE_ERROR'
    ));
  }
}
