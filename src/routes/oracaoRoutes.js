/**
 * Oracao Routes
 * Contains all routes related to prayer management with Swagger documentation
 */

import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
  createPrayer,
  getUserPrayers,
  getPrayerById,
  updatePrayer,
  deletePrayer,
  toggleFavorite,
  getPrayerStats,
  getPrayerCategories,
  exportPrayersPDF,
} from '../controllers/oracaoController.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Prayer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Prayer unique identifier
 *         titulo:
 *           type: string
 *           description: Prayer title
 *         categoria:
 *           type: string
 *           enum: [gratidao, pedido, intercession, contemplation, confissao, louvor, adoracao, petição]
 *           description: Prayer category
 *         conteudo:
 *           type: string
 *           description: Prayer content
 *         emocoes:
 *           type: array
 *           items:
 *             type: string
 *           description: Associated emotions
 *         tempoGasto:
 *           type: integer
 *           nullable: true
 *           description: Time spent in minutes
 *         privacidade:
 *           type: string
 *           enum: [privada, compartilhada]
 *           default: privada
 *           description: Privacy setting
 *         isFavorita:
 *           type: boolean
 *           default: false
 *           description: Whether prayer is marked as favorite
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     CreatePrayerRequest:
 *       type: object
 *       required:
 *         - titulo
 *         - categoria
 *         - conteudo
 *       properties:
 *         titulo:
 *           type: string
 *           description: Prayer title
 *         categoria:
 *           type: string
 *           enum: [gratidao, pedido, intercession, contemplation, confissao, louvor, adoracao, petição]
 *           description: Prayer category
 *         conteudo:
 *           type: string
 *           description: Prayer content
 *         emocoes:
 *           type: array
 *           items:
 *             type: string
 *           description: Associated emotions
 *         tempoGasto:
 *           type: integer
 *           description: Time spent in minutes
 *         privacidade:
 *           type: string
 *           enum: [privada, compartilhada]
 *           default: privada
 *           description: Privacy setting
 *         isFavorita:
 *           type: boolean
 *           default: false
 *           description: Whether prayer is marked as favorite
 */

/**
 * @swagger
 * /prayers:
 *   post:
 *     summary: Create a new prayer
 *     description: Creates a new prayer entry for the authenticated user
 *     tags: [Prayer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePrayerRequest'
 *     responses:
 *       201:
 *         description: Prayer created successfully
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
 *                   example: "Oração criada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     prayer:
 *                       $ref: '#/components/schemas/Prayer'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, createPrayer);

/**
 * @swagger
 * /prayers:
 *   get:
 *     summary: Get user's prayers
 *     description: Retrieves user's prayers with pagination and filters
 *     tags: [Prayer]
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
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: favoritas
 *         schema:
 *           type: boolean
 *         description: Filter favorites only
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content
 *     responses:
 *       200:
 *         description: Prayers retrieved successfully
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
 *                   example: "Orações recuperadas com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     prayers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Prayer'
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
router.get('/', authenticateToken, getUserPrayers);

/**
 * @swagger
 * /prayers/categories:
 *   get:
 *     summary: Get prayer categories
 *     description: Retrieves available prayer categories
 *     tags: [Prayer]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                   example: "Categorias de oração recuperadas com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/categories', getPrayerCategories);

/**
 * @swagger
 * /prayers/stats:
 *   get:
 *     summary: Get prayer statistics
 *     description: Retrieves prayer statistics for the authenticated user
 *     tags: [Prayer]
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
 *                   example: "Estatísticas de oração recuperadas com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalPrayers:
 *                           type: integer
 *                         categoriesCount:
 *                           type: array
 *                         favoritesCount:
 *                           type: integer
 *                         totalTimeSpent:
 *                           type: integer
 *                         recentPrayers:
 *                           type: array
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticateToken, getPrayerStats);

/**
 * @swagger
 * /prayers/{id}:
 *   get:
 *     summary: Get prayer by ID
 *     description: Retrieves a specific prayer by its ID
 *     tags: [Prayer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prayer ID
 *     responses:
 *       200:
 *         description: Prayer retrieved successfully
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
 *                   example: "Oração recuperada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     prayer:
 *                       $ref: '#/components/schemas/Prayer'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Prayer not found
 */
router.get('/:id', authenticateToken, getPrayerById);

/**
 * @swagger
 * /prayers/{id}:
 *   put:
 *     summary: Update prayer
 *     description: Updates a specific prayer
 *     tags: [Prayer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prayer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               categoria:
 *                 type: string
 *               conteudo:
 *                 type: string
 *               emocoes:
 *                 type: array
 *                 items:
 *                   type: string
 *               tempoGasto:
 *                 type: integer
 *               privacidade:
 *                 type: string
 *               isFavorita:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Prayer updated successfully
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
 *                   example: "Oração atualizada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     prayer:
 *                       $ref: '#/components/schemas/Prayer'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Prayer not found
 */
router.put('/:id', authenticateToken, updatePrayer);

/**
 * @swagger
 * /prayers/{id}:
 *   delete:
 *     summary: Delete prayer
 *     description: Deletes a specific prayer
 *     tags: [Prayer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prayer ID
 *     responses:
 *       200:
 *         description: Prayer deleted successfully
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
 *                   example: "Oração excluída com sucesso"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Prayer not found
 */
router.delete('/:id', authenticateToken, deletePrayer);

/**
 * @swagger
 * /prayers/{id}/favorite:
 *   patch:
 *     summary: Toggle prayer favorite status
 *     description: Toggles the favorite status of a specific prayer
 *     tags: [Prayer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prayer ID
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
 *                     prayer:
 *                       $ref: '#/components/schemas/Prayer'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Prayer not found
 */
/**
 * @swagger
 * /prayers/export:
 *   get:
 *     summary: Export prayers to PDF
 *     description: Exports user's prayers to a PDF document
 *     tags: [Prayer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: favoritas
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
 *         description: No prayers found for export
 */
router.get('/export', authenticateToken, exportPrayersPDF);

router.patch('/:id/favorite', authenticateToken, toggleFavorite);

export default router;