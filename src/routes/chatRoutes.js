/**
 * Chat Routes
 * Routes for chat sessions and messaging with Swagger documentation
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { 
  createSession, 
  getSessions, 
  getSession, 
  sendMessage, 
  renameSession, 
  closeSession, 
  deleteSession,
  getSessionSuggestions
} from '../controllers/chatController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { 
  validateRequest, 
  createSessionSchema, 
  sendMessageSchema, 
  updateSessionSchema,
  paginationSchema
} from '../utils/zodValidation.js';

const router = Router();

// Rate limiting for chat routes (more restrictive due to OpenAI costs)
const chatRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // limit each IP to 30 requests per windowMs for chat
  message: {
    success: false,
    message: 'Too many chat requests, please try again later.'
  }
});

const messageRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 messages per minute
  message: {
    success: false,
    message: 'Too many messages, please slow down.'
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatSession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         mode:
 *           type: string
 *           enum: [COUNCIL, DECISION]
 *         title:
 *           type: string
 *         closed:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         participants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               character:
 *                 $ref: '#/components/schemas/Character'
 *               orderIndex:
 *                 type: integer
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *     
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         role:
 *           type: string
 *           enum: [USER, CHARACTER, NARRATOR, SUMMARY, SYSTEM]
 *         authorKey:
 *           type: string
 *           nullable: true
 *         authorName:
 *           type: string
 *           nullable: true
 *         content:
 *           type: string
 *         meta:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     CreateSession:
 *       type: object
 *       required:
 *         - mode
 *         - characters
 *       properties:
 *         mode:
 *           type: string
 *           enum: [COUNCIL, DECISION]
 *           example: "COUNCIL"
 *         characters:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *           maxItems: 6
 *           example: ["moises", "salomao", "freud"]
 *         title:
 *           type: string
 *           maxLength: 100
 *           example: "Conselhos sobre relacionamentos"
 *     
 *     SendMessage:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 2000
 *           example: "Como posso melhorar minha autoestima?"
 *         stream:
 *           type: boolean
 *           default: false
 *           example: false
 */

/**
 * @swagger
 * /api/chat/sessions:
 *   post:
 *     summary: Create new chat session
 *     description: Create a new chat session with selected characters in specified mode
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSession'
 *           examples:
 *             council:
 *               summary: Council mode example
 *               value:
 *                 mode: "COUNCIL"
 *                 characters: ["moises", "salomao", "freud"]
 *                 title: "Conselho sobre liderança"
 *             decision:
 *               summary: Decision mode example  
 *               value:
 *                 mode: "DECISION"
 *                 characters: ["jose-egito", "salomao"]
 *                 title: "Decisão sobre mudança de carreira"
 *     responses:
 *       201:
 *         description: Chat session created successfully
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
 *                   example: "Chat session created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       $ref: '#/components/schemas/ChatSession'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.post('/sessions', 
  authenticateToken, 
  chatRateLimit,
  validateRequest(createSessionSchema), 
  createSession
);

/**
 * @swagger
 * /api/chat/sessions:
 *   get:
 *     summary: Get user's chat sessions
 *     description: Retrieve paginated list of user's chat sessions with summary info
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
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
 *                   example: "Sessions retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           mode:
 *                             type: string
 *                           title:
 *                             type: string
 *                           closed:
 *                             type: boolean
 *                           messageCount:
 *                             type: integer
 *                           participants:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Character'
 *                           lastMessage:
 *                             $ref: '#/components/schemas/Message'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalCount:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/sessions', 
  authenticateToken, 
  validateRequest(paginationSchema, 'query'),
  getSessions
);

/**
 * @swagger
 * /api/chat/sessions/{id}:
 *   get:
 *     summary: Get session details with messages
 *     description: Retrieve detailed session information including messages with cursor-based pagination
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination (base64 encoded)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 30
 *         description: Number of messages to retrieve
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
 *                   example: "Session retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       $ref: '#/components/schemas/ChatSession'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
router.get('/sessions/:id', authenticateToken, getSession);

/**
 * @swagger
 * /api/chat/sessions/{id}/message:
 *   post:
 *     summary: Send message to session
 *     description: Send a user message and get AI responses based on session mode
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessage'
 *           examples:
 *             simple:
 *               summary: Simple message
 *               value:
 *                 content: "Como posso ser mais confiante?"
 *                 stream: false
 *             streaming:
 *               summary: Streaming message
 *               value:
 *                 content: "Preciso de conselhos sobre minha carreira"
 *                 stream: true
 *     responses:
 *       200:
 *         description: Message processed successfully (non-streaming)
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
 *                   example: "Message processed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     mode:
 *                       type: string
 *                       enum: [COUNCIL, DECISION]
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           characterKey:
 *                             type: string
 *                           characterName:
 *                             type: string
 *                           content:
 *                             type: string
 *                     suggested_topics:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Validation error or content moderation failure
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found or closed
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.post('/sessions/:id/message', 
  authenticateToken, 
  messageRateLimit,
  validateRequest(sendMessageSchema), 
  sendMessage
);

/**
 * @swagger
 * /api/chat/sessions/{id}/rename:
 *   post:
 *     summary: Rename session
 *     description: Update the title of a chat session
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Novo título da conversa"
 *     responses:
 *       200:
 *         description: Session renamed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
router.post('/sessions/:id/rename', 
  authenticateToken, 
  validateRequest(updateSessionSchema), 
  renameSession
);

/**
 * @swagger
 * /api/chat/sessions/{id}/close:
 *   post:
 *     summary: Close session
 *     description: Mark a chat session as closed (prevents new messages)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session closed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
router.post('/sessions/:id/close', authenticateToken, closeSession);

/**
 * @swagger
 * /api/chat/sessions/{id}:
 *   delete:
 *     summary: Delete session
 *     description: Permanently delete a chat session and all its messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
router.delete('/sessions/:id', authenticateToken, deleteSession);

/**
 * @swagger
 * /api/chat/sessions/{id}/suggestions:
 *   get:
 *     summary: Get session topic suggestions
 *     description: Retrieve suggested topics for continuing the conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Suggestions retrieved successfully
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
 *                   example: "Suggestions retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Desenvolvimento pessoal", "Relacionamentos familiares", "Propósito de vida"]
 *                     sessionId:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
router.get('/sessions/:id/suggestions', authenticateToken, getSessionSuggestions);

export default router;
