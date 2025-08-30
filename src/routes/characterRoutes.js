/**
 * Character Routes
 * Routes for character management with Swagger documentation
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { 
  getCharacters, 
  getCharacterByKey, 
  createCharacter, 
  updateCharacter, 
  deleteCharacter 
} from '../controllers/characterController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateRequest, createCharacterSchema } from '../utils/zodValidation.js';

const router = Router();

// Rate limiting for character routes
const characterRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Character:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         key:
 *           type: string
 *           example: "moises"
 *         name:
 *           type: string
 *           example: "Moisés"
 *         avatarUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *         styleTags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["espiritual", "liderança"]
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     CreateCharacter:
 *       type: object
 *       required:
 *         - key
 *         - name
 *         - basePrompt
 *       properties:
 *         key:
 *           type: string
 *           pattern: "^[a-z0-9-]+$"
 *           example: "moises"
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Moisés"
 *         avatarUrl:
 *           type: string
 *           format: uri
 *         basePrompt:
 *           type: string
 *           minLength: 10
 *           maxLength: 2000
 *         styleTags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["espiritual", "liderança"]
 */

/**
 * @swagger
 * /api/characters:
 *   get:
 *     summary: Get all active characters
 *     description: Retrieve a list of all active characters available for chat sessions
 *     tags: [Characters]
 *     responses:
 *       200:
 *         description: List of characters retrieved successfully
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
 *                   example: "Characters retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     characters:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Character'
 *                     count:
 *                       type: integer
 *                       example: 4
 *       500:
 *         description: Internal server error
 */
router.get('/', characterRateLimit, getCharacters);

/**
 * @swagger
 * /api/characters/{key}:
 *   get:
 *     summary: Get character by key
 *     description: Retrieve detailed information about a specific character
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique character key
 *         example: "moises"
 *     responses:
 *       200:
 *         description: Character retrieved successfully
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
 *                   example: "Character retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     character:
 *                       $ref: '#/components/schemas/Character'
 *       404:
 *         description: Character not found
 *       500:
 *         description: Internal server error
 */
router.get('/:key', characterRateLimit, getCharacterByKey);

/**
 * @swagger
 * /api/characters:
 *   post:
 *     summary: Create new character
 *     description: Create a new character (Admin functionality)
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCharacter'
 *           example:
 *             key: "moises"
 *             name: "Moisés"
 *             avatarUrl: "https://example.com/moises.jpg"
 *             basePrompt: "Você é Moisés, líder espiritual e guia do povo de Israel..."
 *             styleTags: ["espiritual", "liderança", "obediência"]
 *     responses:
 *       201:
 *         description: Character created successfully
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
 *                   example: "Character created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     character:
 *                       $ref: '#/components/schemas/Character'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Character key already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', 
  authenticateToken, 
  validateRequest(createCharacterSchema), 
  createCharacter
);

/**
 * @swagger
 * /api/characters/{key}:
 *   put:
 *     summary: Update character
 *     description: Update an existing character (Admin functionality)
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique character key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *               basePrompt:
 *                 type: string
 *               styleTags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Character updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Character not found
 *       500:
 *         description: Internal server error
 */
router.put('/:key', authenticateToken, updateCharacter);

/**
 * @swagger
 * /api/characters/{key}:
 *   delete:
 *     summary: Deactivate character
 *     description: Deactivate a character (soft delete - Admin functionality)
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique character key
 *     responses:
 *       200:
 *         description: Character deactivated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Character not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:key', authenticateToken, deleteCharacter);

export default router;
