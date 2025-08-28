/**
 * Questionnaire Routes
 * Contains all routes related to questionnaire management with Swagger documentation
 */

import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
  createQuestionnaire,
  getQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
  hasQuestionnaire,
  getQuestionnaireStats,
} from '../controllers/questionnaireController.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Questionnaire:
 *       type: object
 *       required:
 *         - ageRange
 *         - currentSituation
 *         - anxietyFrequency
 *         - sadnessHandling
 *         - socialLife
 *         - loveRelationships
 *         - workFeeling
 *         - motivation
 *         - routine
 *         - sleep
 *         - selfKnowledgeGoal
 *         - values
 *         - challenge
 *         - childhoodInfluence
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the questionnaire
 *         userId:
 *           type: string
 *           description: ID of the user who owns this questionnaire
 *         ageRange:
 *           type: string
 *           enum: ['18-25', '26-35', '36-45', '46-55', '56+']
 *           description: User's age range
 *         currentSituation:
 *           type: string
 *           enum: ['estudante', 'trabalhando', 'desempregado', 'aposentado', 'empreendedor', 'outro']
 *           description: User's current life situation
 *         anxietyFrequency:
 *           type: string
 *           enum: ['nunca', 'raramente', 'as-vezes', 'frequentemente', 'sempre']
 *           description: How frequently user experiences anxiety
 *         sadnessHandling:
 *           type: array
 *           items:
 *             type: string
 *             enum: ['conversar', 'exercitar', 'meditar', 'ouvir-musica', 'isolamento', 'buscar-ajuda', 'outro']
 *           description: Ways user handles sadness
 *         socialLife:
 *           type: string
 *           enum: ['muito-ativa', 'ativa', 'moderada', 'pouco-ativa', 'isolada']
 *           description: User's social life activity level
 *         loveRelationships:
 *           type: string
 *           enum: ['feliz', 'satisfeita', 'complicada', 'insatisfeita', 'solteiro', 'nao-interessado']
 *           description: User's satisfaction with romantic relationships
 *         workFeeling:
 *           type: string
 *           enum: ['realizado', 'satisfeito', 'neutro', 'insatisfeito', 'frustrado', 'nao-trabalho']
 *           description: User's feelings about work
 *         motivation:
 *           type: array
 *           items:
 *             type: string
 *             enum: ['familia', 'carreira', 'dinheiro', 'saude', 'espiritualidade', 'conhecimento', 'viagem', 'relacionamentos', 'outro']
 *           description: User's main motivations in life
 *         routine:
 *           type: string
 *           enum: ['muito-organizada', 'organizada', 'moderada', 'desorganizada', 'caotica']
 *           description: User's routine organization level
 *         sleep:
 *           type: string
 *           enum: ['excelente', 'boa', 'regular', 'ruim', 'pessima']
 *           description: User's sleep quality
 *         selfKnowledgeGoal:
 *           type: array
 *           items:
 *             type: string
 *             enum: ['autoestima', 'relacionamentos', 'carreira', 'espiritualidade', 'emocoes', 'proposito', 'habitos', 'comunicacao', 'outro']
 *           description: User's self-knowledge goals
 *         values:
 *           type: array
 *           items:
 *             type: string
 *             enum: ['familia', 'honestidade', 'liberdade', 'justica', 'sucesso', 'lealdade', 'criatividade', 'paz', 'aventura', 'conhecimento', 'outro']
 *           description: User's core values
 *         challenge:
 *           type: string
 *           enum: ['ansiedade', 'depressao', 'autoestima', 'relacionamentos', 'carreira', 'proposito', 'habitos', 'estresse', 'outro']
 *           description: User's biggest current challenge
 *         childhoodInfluence:
 *           type: string
 *           enum: ['muito-positiva', 'positiva', 'neutra', 'negativa', 'muito-negativa', 'nao-sei']
 *           description: User's perception of childhood influence on current life
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when questionnaire was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when questionnaire was last updated
 *
 *     QuestionnaireInput:
 *       type: object
 *       required:
 *         - ageRange
 *         - currentSituation
 *         - anxietyFrequency
 *         - sadnessHandling
 *         - socialLife
 *         - loveRelationships
 *         - workFeeling
 *         - motivation
 *         - routine
 *         - sleep
 *         - selfKnowledgeGoal
 *         - values
 *         - challenge
 *         - childhoodInfluence
 *       properties:
 *         ageRange:
 *           type: string
 *           enum: ['18-25', '26-35', '36-45', '46-55', '56+']
 *           example: '26-35'
 *         currentSituation:
 *           type: string
 *           enum: ['estudante', 'trabalhando', 'desempregado', 'aposentado', 'empreendedor', 'outro']
 *           example: 'trabalhando'
 *         anxietyFrequency:
 *           type: string
 *           enum: ['nunca', 'raramente', 'as-vezes', 'frequentemente', 'sempre']
 *           example: 'as-vezes'
 *         sadnessHandling:
 *           type: array
 *           items:
 *             type: string
 *             enum: ['conversar', 'exercitar', 'meditar', 'ouvir-musica', 'isolamento', 'buscar-ajuda', 'outro']
 *           example: ['conversar', 'exercitar', 'meditar']
 *         socialLife:
 *           type: string
 *           enum: ['muito-ativa', 'ativa', 'moderada', 'pouco-ativa', 'isolada']
 *           example: 'ativa'
 *         loveRelationships:
 *           type: string
 *           enum: ['feliz', 'satisfeita', 'complicada', 'insatisfeita', 'solteiro', 'nao-interessado']
 *           example: 'satisfeita'
 *         workFeeling:
 *           type: string
 *           enum: ['realizado', 'satisfeito', 'neutro', 'insatisfeito', 'frustrado', 'nao-trabalho']
 *           example: 'satisfeito'
 *         motivation:
 *           type: array
 *           items:
 *             type: string
 *             enum: ['familia', 'carreira', 'dinheiro', 'saude', 'espiritualidade', 'conhecimento', 'viagem', 'relacionamentos', 'outro']
 *           example: ['familia', 'carreira', 'saude']
 *         routine:
 *           type: string
 *           enum: ['muito-organizada', 'organizada', 'moderada', 'desorganizada', 'caotica']
 *           example: 'organizada'
 *         sleep:
 *           type: string
 *           enum: ['excelente', 'boa', 'regular', 'ruim', 'pessima']
 *           example: 'boa'
 *         selfKnowledgeGoal:
 *           type: array
 *           items:
 *             type: string
 *             enum: ['autoestima', 'relacionamentos', 'carreira', 'espiritualidade', 'emocoes', 'proposito', 'habitos', 'comunicacao', 'outro']
 *           example: ['autoestima', 'emocoes', 'proposito']
 *         values:
 *           type: array
 *           items:
 *             type: string
 *             enum: ['familia', 'honestidade', 'liberdade', 'justica', 'sucesso', 'lealdade', 'criatividade', 'paz', 'aventura', 'conhecimento', 'outro']
 *           example: ['familia', 'honestidade', 'liberdade']
 *         challenge:
 *           type: string
 *           enum: ['ansiedade', 'depressao', 'autoestima', 'relacionamentos', 'carreira', 'proposito', 'habitos', 'estresse', 'outro']
 *           example: 'ansiedade'
 *         childhoodInfluence:
 *           type: string
 *           enum: ['muito-positiva', 'positiva', 'neutra', 'negativa', 'muito-negativa', 'nao-sei']
 *           example: 'positiva'
 */

/**
 * @swagger
 * /user/questionnaire:
 *   post:
 *     summary: Create a new questionnaire
 *     description: Creates a new questionnaire for the authenticated user. User can only have one questionnaire.
 *     tags: [Questionnaire]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestionnaireInput'
 *     responses:
 *       201:
 *         description: Questionnaire created successfully
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
 *                   example: "Questionário criado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     questionnaire:
 *                       $ref: '#/components/schemas/Questionnaire'
 *       400:
 *         description: Validation error or user already has a questionnaire
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Usuário já possui um questionário respondido"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 */
router.post('/', authenticateToken, createQuestionnaire);

/**
 * @swagger
 * /user/questionnaire:
 *   get:
 *     summary: Get user's questionnaire
 *     description: Retrieves the questionnaire for the authenticated user
 *     tags: [Questionnaire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Questionnaire retrieved successfully
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
 *                   example: "Questionário recuperado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     questionnaire:
 *                       $ref: '#/components/schemas/Questionnaire'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Questionnaire not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Questionário não encontrado. Complete o questionário primeiro."
 */
router.get('/', authenticateToken, getQuestionnaire);

/**
 * @swagger
 * /user/questionnaire:
 *   put:
 *     summary: Update user's questionnaire
 *     description: Updates the questionnaire for the authenticated user. All fields are optional.
 *     tags: [Questionnaire]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ageRange:
 *                 type: string
 *                 enum: ['18-25', '26-35', '36-45', '46-55', '56+']
 *               currentSituation:
 *                 type: string
 *                 enum: ['estudante', 'trabalhando', 'desempregado', 'aposentado', 'empreendedor', 'outro']
 *               anxietyFrequency:
 *                 type: string
 *                 enum: ['nunca', 'raramente', 'as-vezes', 'frequentemente', 'sempre']
 *               sadnessHandling:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: ['conversar', 'exercitar', 'meditar', 'ouvir-musica', 'isolamento', 'buscar-ajuda', 'outro']
 *               socialLife:
 *                 type: string
 *                 enum: ['muito-ativa', 'ativa', 'moderada', 'pouco-ativa', 'isolada']
 *               loveRelationships:
 *                 type: string
 *                 enum: ['feliz', 'satisfeita', 'complicada', 'insatisfeita', 'solteiro', 'nao-interessado']
 *               workFeeling:
 *                 type: string
 *                 enum: ['realizado', 'satisfeito', 'neutro', 'insatisfeito', 'frustrado', 'nao-trabalho']
 *               motivation:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: ['familia', 'carreira', 'dinheiro', 'saude', 'espiritualidade', 'conhecimento', 'viagem', 'relacionamentos', 'outro']
 *               routine:
 *                 type: string
 *                 enum: ['muito-organizada', 'organizada', 'moderada', 'desorganizada', 'caotica']
 *               sleep:
 *                 type: string
 *                 enum: ['excelente', 'boa', 'regular', 'ruim', 'pessima']
 *               selfKnowledgeGoal:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: ['autoestima', 'relacionamentos', 'carreira', 'espiritualidade', 'emocoes', 'proposito', 'habitos', 'comunicacao', 'outro']
 *               values:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: ['familia', 'honestidade', 'liberdade', 'justica', 'sucesso', 'lealdade', 'criatividade', 'paz', 'aventura', 'conhecimento', 'outro']
 *               challenge:
 *                 type: string
 *                 enum: ['ansiedade', 'depressao', 'autoestima', 'relacionamentos', 'carreira', 'proposito', 'habitos', 'estresse', 'outro']
 *               childhoodInfluence:
 *                 type: string
 *                 enum: ['muito-positiva', 'positiva', 'neutra', 'negativa', 'muito-negativa', 'nao-sei']
 *     responses:
 *       200:
 *         description: Questionnaire updated successfully
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
 *                   example: "Questionário atualizado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     questionnaire:
 *                       $ref: '#/components/schemas/Questionnaire'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Questionnaire not found
 */
router.put('/', authenticateToken, updateQuestionnaire);

/**
 * @swagger
 * /user/questionnaire:
 *   delete:
 *     summary: Delete user's questionnaire
 *     description: Deletes the questionnaire for the authenticated user
 *     tags: [Questionnaire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Questionnaire deleted successfully
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
 *                   example: "Questionário deletado com sucesso"
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Questionnaire not found
 */
router.delete('/', authenticateToken, deleteQuestionnaire);

/**
 * @swagger
 * /user/questionnaire/status:
 *   get:
 *     summary: Check if user has completed questionnaire
 *     description: Returns whether the authenticated user has completed a questionnaire
 *     tags: [Questionnaire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Questionnaire status checked successfully
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
 *                   example: "Status do questionário verificado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasQuestionnaire:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/status', authenticateToken, hasQuestionnaire);

/**
 * @swagger
 * /user/questionnaire/stats:
 *   get:
 *     summary: Get questionnaire statistics (Admin)
 *     description: Returns statistical data about all questionnaires. This is typically for admin use.
 *     tags: [Questionnaire]
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
 *                   example: "Estatísticas do questionário recuperadas com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalQuestionnaires:
 *                           type: number
 *                           example: 150
 *                         ageRangeDistribution:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               ageRange:
 *                                 type: string
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   ageRange:
 *                                     type: number
 *                         anxietyFrequencyDistribution:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               anxietyFrequency:
 *                                 type: string
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   anxietyFrequency:
 *                                     type: number
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/stats', authenticateToken, getQuestionnaireStats);

export default router;
