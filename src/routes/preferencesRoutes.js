/**
 * Preferences Routes
 * Routes for user preferences management with Swagger documentation
 */

import { Router } from 'express';
import { resourceRateLimit } from '../middlewares/rateLimiting.js';
import {
  getPreferences,
  createPreferences,
  updatePreferences,
  updateNotifications,
  getNotifications,
  deletePreferences
} from '../controllers/preferencesController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { 
  validateRequest, 
  createPreferencesSchema, 
  updatePreferencesSchema,
  updateNotificationsSchema
} from '../utils/zodValidation.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Preferences:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         responseTone:
 *           type: string
 *           enum: [breve, detalhada, espiritual, pratica]
 *           default: detalhada
 *         notificationEnabled:
 *           type: boolean
 *           default: false
 *         notificationType:
 *           type: string
 *           enum: [daily, weekly]
 *           nullable: true
 *         notificationTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           example: "08:00"
 *           nullable: true
 *         notificationDays:
 *           type: array
 *           items:
 *             type: string
 *             enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *           default: []
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     CreatePreferences:
 *       type: object
 *       properties:
 *         responseTone:
 *           type: string
 *           enum: [breve, detalhada, espiritual, pratica]
 *           default: detalhada
 *           example: "espiritual"
 *     
 *     UpdatePreferences:
 *       type: object
 *       properties:
 *         responseTone:
 *           type: string
 *           enum: [breve, detalhada, espiritual, pratica]
 *           example: "pratica"
 *     
 *     UpdateNotifications:
 *       type: object
 *       properties:
 *         notificationEnabled:
 *           type: boolean
 *           example: true
 *         notificationType:
 *           type: string
 *           enum: [daily, weekly]
 *           example: "weekly"
 *         notificationTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           example: "07:30"
 *         notificationDays:
 *           type: array
 *           items:
 *             type: string
 *             enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *           example: ["monday", "friday"]
 */

/**
 * @swagger
 * /api/user/preferences:
 *   get:
 *     summary: Get user preferences
 *     description: Retrieve current user's preferences or return defaults
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Preferences retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     preferences:
 *                       $ref: '#/components/schemas/Preferences'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, getPreferences);

/**
 * @swagger
 * /api/user/preferences:
 *   post:
 *     summary: Create user preferences
 *     description: Create initial preferences for the user
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePreferences'
 *           examples:
 *             spiritual:
 *               summary: Spiritual response tone
 *               value:
 *                 responseTone: "espiritual"
 *             practical:
 *               summary: Practical response tone
 *               value:
 *                 responseTone: "pratica"
 *     responses:
 *       201:
 *         description: Preferences created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Preferences created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     preferences:
 *                       $ref: '#/components/schemas/Preferences'
 *       400:
 *         description: Validation error or preferences already exist
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', 
  authenticateToken, 
  resourceRateLimit,
  validateRequest(createPreferencesSchema), 
  createPreferences
);

/**
 * @swagger
 * /api/user/preferences:
 *   put:
 *     summary: Update user preferences
 *     description: Update existing preferences or create if they don't exist
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePreferences'
 *           examples:
 *             brief:
 *               summary: Brief responses
 *               value:
 *                 responseTone: "breve"
 *             detailed:
 *               summary: Detailed responses
 *               value:
 *                 responseTone: "detalhada"
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Preferences updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     preferences:
 *                       $ref: '#/components/schemas/Preferences'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/', 
  authenticateToken, 
  resourceRateLimit,
  validateRequest(updatePreferencesSchema), 
  updatePreferences
);

/**
 * @swagger
 * /api/user/preferences:
 *   delete:
 *     summary: Delete user preferences
 *     description: Delete all user preferences (reset to defaults)
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Preferences not found
 *       500:
 *         description: Internal server error
 */
router.delete('/', authenticateToken, deletePreferences);

/**
 * @swagger
 * /api/user/preferences/notifications:
 *   get:
 *     summary: Get notification preferences
 *     description: Retrieve user's notification settings
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notification preferences retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: object
 *                       properties:
 *                         notificationEnabled:
 *                           type: boolean
 *                         notificationType:
 *                           type: string
 *                           enum: [daily, weekly]
 *                           nullable: true
 *                         notificationTime:
 *                           type: string
 *                           nullable: true
 *                         notificationDays:
 *                           type: array
 *                           items:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/notifications', authenticateToken, getNotifications);

/**
 * @swagger
 * /api/user/preferences/notifications:
 *   put:
 *     summary: Update notification preferences
 *     description: Update user's notification settings
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotifications'
 *           examples:
 *             enable_daily:
 *               summary: Enable daily notifications
 *               value:
 *                 notificationEnabled: true
 *                 notificationType: "daily"
 *                 notificationTime: "08:00"
 *             enable_weekly:
 *               summary: Enable weekly notifications
 *               value:
 *                 notificationEnabled: true
 *                 notificationType: "weekly"
 *                 notificationTime: "07:30"
 *                 notificationDays: ["monday", "friday"]
 *             disable:
 *               summary: Disable notifications
 *               value:
 *                 notificationEnabled: false
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notification preferences updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: object
 *                       properties:
 *                         notificationEnabled:
 *                           type: boolean
 *                         notificationType:
 *                           type: string
 *                           enum: [daily, weekly]
 *                         notificationTime:
 *                           type: string
 *                         notificationDays:
 *                           type: array
 *                           items:
 *                             type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/notifications', 
  authenticateToken, 
  resourceRateLimit,
  validateRequest(updateNotificationsSchema), 
  updateNotifications
);

export default router;
