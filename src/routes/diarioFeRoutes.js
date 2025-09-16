/**
 * Diario Fe Routes
 * Contains all routes related to faith diary management with Swagger documentation
 */

import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
  createEntry,
  getUserEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  toggleFavorite,
  getDiaryStats,
  getEntriesInDateRange,
  searchEntries,
  getEmotionalClimates,
  getCommonEmotions,
  exportDiaryPDF,
} from '../controllers/diarioFeController.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DiaryEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Entry unique identifier
 *         titulo:
 *           type: string
 *           nullable: true
 *           description: Entry title
 *         conteudo:
 *           type: string
 *           description: Entry content
 *         emocoes:
 *           type: array
 *           items:
 *             type: string
 *           description: Associated emotions
 *         versiculos:
 *           type: array
 *           items:
 *             type: string
 *           description: Referenced bible verses
 *         gratidao:
 *           type: array
 *           items:
 *             type: string
 *           description: Things grateful for
 *         oracoes:
 *           type: array
 *           items:
 *             type: string
 *           description: Prayer requests/prayers mentioned
 *         reflexoes:
 *           type: string
 *           nullable: true
 *           description: Personal reflections
 *         clima:
 *           type: string
 *           nullable: true
 *           enum: [paz, alegria, gratidao, esperanca, ansiedade, tristeza, confusao, medo, raiva, solidao, contentamento, adoracao, reflexao, contemplacao]
 *           description: Emotional climate
 *         privacidade:
 *           type: string
 *           enum: [privada, compartilhada]
 *           default: privada
 *           description: Privacy setting
 *         isFavorito:
 *           type: boolean
 *           default: false
 *           description: Whether entry is marked as favorite
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     CreateDiaryEntryRequest:
 *       type: object
 *       required:
 *         - conteudo
 *       properties:
 *         titulo:
 *           type: string
 *           description: Entry title
 *         conteudo:
 *           type: string
 *           description: Entry content
 *         emocoes:
 *           type: array
 *           items:
 *             type: string
 *           description: Associated emotions
 *         versiculos:
 *           type: array
 *           items:
 *             type: string
 *           description: Referenced bible verses
 *         gratidao:
 *           type: array
 *           items:
 *             type: string
 *           description: Things grateful for
 *         oracoes:
 *           type: array
 *           items:
 *             type: string
 *           description: Prayer requests/prayers mentioned
 *         reflexoes:
 *           type: string
 *           description: Personal reflections
 *         clima:
 *           type: string
 *           enum: [paz, alegria, gratidao, esperanca, ansiedade, tristeza, confusao, medo, raiva, solidao, contentamento, adoracao, reflexao, contemplacao]
 *           description: Emotional climate
 *         privacidade:
 *           type: string
 *           enum: [privada, compartilhada]
 *           default: privada
 *           description: Privacy setting
 *         isFavorito:
 *           type: boolean
 *           default: false
 *           description: Whether entry is marked as favorite
 */

/**
 * @swagger
 * /diary:
 *   post:
 *     summary: Create a new diary entry
 *     description: Creates a new faith diary entry for the authenticated user
 *     tags: [Faith Diary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDiaryEntryRequest'
 *     responses:
 *       201:
 *         description: Diary entry created successfully
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
 *                   example: "Entrada do diário criada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     entry:
 *                       $ref: '#/components/schemas/DiaryEntry'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, createEntry);

/**
 * @swagger
 * /diary:
 *   get:
 *     summary: Get user's diary entries
 *     description: Retrieves user's diary entries with pagination and filters
 *     tags: [Faith Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: clima
 *         schema:
 *           type: string
 *         description: Filter by emotional climate
 *       - in: query
 *         name: favoritos
 *         schema:
 *           type: boolean
 *         description: Filter favorites only
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, content, and reflections
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter until this date
 *     responses:
 *       200:
 *         description: Diary entries retrieved successfully
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
 *                   example: "Entradas do diário recuperadas com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     entries:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DiaryEntry'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, getUserEntries);

/**
 * @swagger
 * /diary/climates:
 *   get:
 *     summary: Get emotional climates
 *     description: Retrieves available emotional climates
 *     tags: [Faith Diary]
 *     responses:
 *       200:
 *         description: Climates retrieved successfully
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
 *                   example: "Climas emocionais recuperados com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     climates:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/climates', getEmotionalClimates);

/**
 * @swagger
 * /diary/emotions:
 *   get:
 *     summary: Get common emotions
 *     description: Retrieves common emotions list
 *     tags: [Faith Diary]
 *     responses:
 *       200:
 *         description: Emotions retrieved successfully
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
 *                   example: "Emoções comuns recuperadas com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     emotions:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/emotions', getCommonEmotions);

/**
 * @swagger
 * /diary/stats:
 *   get:
 *     summary: Get diary statistics
 *     description: Retrieves diary statistics for the authenticated user
 *     tags: [Faith Diary]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                   example: "Estatísticas do diário recuperadas com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalEntries:
 *                           type: integer
 *                         favoritesCount:
 *                           type: integer
 *                         climaStats:
 *                           type: array
 *                         topEmotions:
 *                           type: array
 *                         recentEntries:
 *                           type: array
 *                         entriesThisMonth:
 *                           type: integer
 *                         totalGratitudeItems:
 *                           type: integer
 *                         totalPrayerItems:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticateToken, getDiaryStats);

/**
 * @swagger
 * /diary/search:
 *   get:
 *     summary: Search diary entries
 *     description: Searches diary entries by content
 *     tags: [Faith Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum results
 *     responses:
 *       200:
 *         description: Search completed successfully
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
 *                   example: "Busca realizada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     entries:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DiaryEntry'
 *       400:
 *         description: Search term is required
 *       401:
 *         description: Unauthorized
 */
router.get('/search', authenticateToken, searchEntries);

/**
 * @swagger
 * /diary/date-range:
 *   get:
 *     summary: Get entries in date range
 *     description: Retrieves diary entries for a specific date range (analytics)
 *     tags: [Faith Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *     responses:
 *       200:
 *         description: Entries retrieved successfully
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
 *                   example: "Entradas no período recuperadas com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     entries:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DiaryEntry'
 *       400:
 *         description: Invalid date range
 *       401:
 *         description: Unauthorized
 */
router.get('/date-range', authenticateToken, getEntriesInDateRange);

/**
 * @swagger
 * /diary/{id}:
 *   get:
 *     summary: Get diary entry by ID
 *     description: Retrieves a specific diary entry by its ID
 *     tags: [Faith Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entry ID
 *     responses:
 *       200:
 *         description: Entry retrieved successfully
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
 *                   example: "Entrada do diário recuperada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     entry:
 *                       $ref: '#/components/schemas/DiaryEntry'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Entry not found
 */
router.get('/:id', authenticateToken, getEntryById);

/**
 * @swagger
 * /diary/{id}:
 *   put:
 *     summary: Update diary entry
 *     description: Updates a specific diary entry
 *     tags: [Faith Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               conteudo:
 *                 type: string
 *               emocoes:
 *                 type: array
 *                 items:
 *                   type: string
 *               versiculos:
 *                 type: array
 *                 items:
 *                   type: string
 *               gratidao:
 *                 type: array
 *                 items:
 *                   type: string
 *               oracoes:
 *                 type: array
 *                 items:
 *                   type: string
 *               reflexoes:
 *                 type: string
 *               clima:
 *                 type: string
 *               privacidade:
 *                 type: string
 *               isFavorito:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Entry updated successfully
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
 *                   example: "Entrada do diário atualizada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     entry:
 *                       $ref: '#/components/schemas/DiaryEntry'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Entry not found
 */
router.put('/:id', authenticateToken, updateEntry);

/**
 * @swagger
 * /diary/{id}:
 *   delete:
 *     summary: Delete diary entry
 *     description: Deletes a specific diary entry
 *     tags: [Faith Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entry ID
 *     responses:
 *       200:
 *         description: Entry deleted successfully
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
 *                   example: "Entrada do diário excluída com sucesso"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Entry not found
 */
router.delete('/:id', authenticateToken, deleteEntry);

/**
 * @swagger
 * /diary/{id}/favorite:
 *   patch:
 *     summary: Toggle entry favorite status
 *     description: Toggles the favorite status of a specific diary entry
 *     tags: [Faith Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entry ID
 *     responses:
 *       200:
 *         description: Favorite status updated successfully
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
 *                   example: "Status de favorita atualizado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     entry:
 *                       $ref: '#/components/schemas/DiaryEntry'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Entry not found
 */
/**
 * @swagger
 * /diary/export:
 *   get:
 *     summary: Export diary entries to PDF
 *     description: Exports user's diary entries to a PDF document
 *     tags: [Faith Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clima
 *         schema:
 *           type: string
 *         description: Filter by emotional climate
 *       - in: query
 *         name: favoritos
 *         schema:
 *           type: boolean
 *         description: Filter favorites only
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter until this date
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No entries found for export
 */
router.get('/export', authenticateToken, exportDiaryPDF);

router.patch('/:id/favorite', authenticateToken, toggleFavorite);

export default router;