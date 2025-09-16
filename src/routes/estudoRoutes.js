/**
 * Estudo Routes
 * Contains all routes related to thematic studies management with Swagger documentation
 */

import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
  getAllStudies,
  getStudyById,
  startStudyParticipation,
  getUserParticipation,
  getUserParticipations,
  updateStudyProgress,
  getSessionContent,
  getUserStudyStats,
  createStudy,
  getStudyCategories,
} from '../controllers/estudoController.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Study:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Study unique identifier
 *         titulo:
 *           type: string
 *           description: Study title
 *         descricao:
 *           type: string
 *           description: Study description
 *         categoria:
 *           type: string
 *           enum: [fe, sabedoria, amor, perda, proposito, esperanca, perdao, gratidao, oração, familia]
 *           description: Study category
 *         tempoEstimado:
 *           type: integer
 *           description: Estimated time in minutes
 *         sessoes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StudySession'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *     StudySession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Session unique identifier
 *         numero:
 *           type: integer
 *           description: Session number
 *         titulo:
 *           type: string
 *           description: Session title
 *         conteudo:
 *           type: string
 *           description: Session content
 *         versiculo:
 *           type: string
 *           nullable: true
 *           description: Related bible verse
 *         reflexao:
 *           type: string
 *           description: Reflection questions
 *     StudyParticipation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Participation unique identifier
 *         userId:
 *           type: string
 *           description: User ID
 *         estudoId:
 *           type: string
 *           description: Study ID
 *         sessaoAtual:
 *           type: integer
 *           description: Current session number
 *         progresso:
 *           type: number
 *           format: float
 *           description: Progress percentage
 *         respostasUsuario:
 *           type: object
 *           nullable: true
 *           description: User answers to study questions
 *         iniciadoEm:
 *           type: string
 *           format: date-time
 *           description: Started timestamp
 *         finalizadoEm:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Finished timestamp
 */

/**
 * @swagger
 * /studies:
 *   get:
 *     summary: Get all available studies
 *     description: Retrieves all available thematic studies with pagination and filters
 *     tags: [Studies]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filter by category
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
 *     responses:
 *       200:
 *         description: Studies retrieved successfully
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
 *                   example: "Estudos recuperados com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     studies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Study'
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
 */
router.get('/', getAllStudies);

/**
 * @swagger
 * /studies:
 *   post:
 *     summary: Create a new study (admin)
 *     description: Creates a new thematic study (admin function)
 *     tags: [Studies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - descricao
 *               - categoria
 *               - tempoEstimado
 *               - sessoes
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Study title
 *               descricao:
 *                 type: string
 *                 description: Study description
 *               categoria:
 *                 type: string
 *                 enum: [fe, sabedoria, amor, perda, proposito, esperanca, perdao, gratidao, oração, familia]
 *                 description: Study category
 *               tempoEstimado:
 *                 type: integer
 *                 description: Estimated time in minutes
 *               sessoes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - titulo
 *                     - conteudo
 *                     - reflexao
 *                   properties:
 *                     titulo:
 *                       type: string
 *                     conteudo:
 *                       type: string
 *                     versiculo:
 *                       type: string
 *                     reflexao:
 *                       type: string
 *     responses:
 *       201:
 *         description: Study created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, createStudy);

/**
 * @swagger
 * /studies/categories:
 *   get:
 *     summary: Get study categories
 *     description: Retrieves available study categories
 *     tags: [Studies]
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
 *                   example: "Categorias de estudos recuperadas com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/categories', getStudyCategories);

/**
 * @swagger
 * /studies/my-participations:
 *   get:
 *     summary: Get user's study participations
 *     description: Retrieves all study participations for the authenticated user
 *     tags: [Studies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ativo, finalizado]
 *         description: Filter by participation status
 *     responses:
 *       200:
 *         description: Participations retrieved successfully
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
 *                   example: "Participações recuperadas com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     participations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StudyParticipation'
 *       401:
 *         description: Unauthorized
 */
router.get('/my-participations', authenticateToken, getUserParticipations);

/**
 * @swagger
 * /studies/my-stats:
 *   get:
 *     summary: Get user's study statistics
 *     description: Retrieves study statistics for the authenticated user
 *     tags: [Studies]
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
 *                   example: "Estatísticas de estudos recuperadas com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalParticipations:
 *                           type: integer
 *                         completedStudies:
 *                           type: integer
 *                         activeStudies:
 *                           type: integer
 *                         categoriesStats:
 *                           type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/my-stats', authenticateToken, getUserStudyStats);

/**
 * @swagger
 * /studies/{id}:
 *   get:
 *     summary: Get study by ID
 *     description: Retrieves a specific study with its sessions
 *     tags: [Studies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Study ID
 *     responses:
 *       200:
 *         description: Study retrieved successfully
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
 *                   example: "Estudo recuperado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     study:
 *                       $ref: '#/components/schemas/Study'
 *       404:
 *         description: Study not found
 */
router.get('/:id', getStudyById);

/**
 * @swagger
 * /studies/{id}/start:
 *   post:
 *     summary: Start study participation
 *     description: Starts user participation in a specific study
 *     tags: [Studies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Study ID
 *     responses:
 *       201:
 *         description: Participation started successfully
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
 *                   example: "Participação no estudo iniciada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     participation:
 *                       $ref: '#/components/schemas/StudyParticipation'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Study not found
 *       409:
 *         description: User already participating
 */
router.post('/:id/start', authenticateToken, startStudyParticipation);

/**
 * @swagger
 * /studies/{id}/participation:
 *   get:
 *     summary: Get user's study participation
 *     description: Retrieves user's participation in a specific study
 *     tags: [Studies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Study ID
 *     responses:
 *       200:
 *         description: Participation retrieved successfully
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
 *                   example: "Participação recuperada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     participation:
 *                       $ref: '#/components/schemas/StudyParticipation'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Participation not found
 */
router.get('/:id/participation', authenticateToken, getUserParticipation);

/**
 * @swagger
 * /studies/{id}/progress:
 *   put:
 *     summary: Update study progress
 *     description: Updates user's progress in a study session
 *     tags: [Studies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Study ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessaoAtual
 *             properties:
 *               sessaoAtual:
 *                 type: integer
 *                 minimum: 1
 *                 description: Current session number
 *               respostasUsuario:
 *                 type: object
 *                 description: User's answers to study questions
 *     responses:
 *       200:
 *         description: Progress updated successfully
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
 *                   example: "Progresso atualizado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     participation:
 *                       $ref: '#/components/schemas/StudyParticipation'
 *       400:
 *         description: Invalid session number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Participation not found
 */
router.put('/:id/progress', authenticateToken, updateStudyProgress);

/**
 * @swagger
 * /studies/{id}/session/{sessionNumber}:
 *   get:
 *     summary: Get session content
 *     description: Retrieves content for a specific study session
 *     tags: [Studies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Study ID
 *       - in: path
 *         name: sessionNumber
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Session number
 *     responses:
 *       200:
 *         description: Session retrieved successfully
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
 *                   example: "Sessão recuperada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       $ref: '#/components/schemas/StudySession'
 *       400:
 *         description: Invalid session number
 *       404:
 *         description: Session not found
 */
router.get('/:id/session/:sessionNumber', getSessionContent);

export default router;