/**
 * Chat Controller
 * Handles chat sessions, messages, and real-time communication
 */

import { sendSuccess, sendError } from '../utils/response.js';
import { NotFoundError, ValidationError, ForbiddenError, AppError } from '../utils/errors.js';
import { getPaginationData, buildPaginationResponse, parseMessageCursor } from '../utils/pagination.js';
import { orchestrateChat } from '../services/chatOrchestrator.js';
import { initSSE, sendSSEEvent, sendSSEError, closeSSE } from '../utils/sse.js';
import { moderateContent } from '../config/openai.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Create new chat session
 */
export const createSession = async (req, res, next) => {
  try {
    const { mode, characters: characterKeys, title } = req.body;
    const userId = req.user.id;

    logger.info(`Creating ${mode} session for user ${userId} with characters: ${characterKeys.join(', ')}`);

    // Validate characters exist and are active
    const characters = await prisma.character.findMany({
      where: {
        key: { in: characterKeys },
        isActive: true
      }
    });

    if (characters.length !== characterKeys.length) {
      const foundKeys = characters.map(c => c.key);
      const missingKeys = characterKeys.filter(key => !foundKeys.includes(key));
      throw new ValidationError(`Characters not found: ${missingKeys.join(', ')}`);
    }

    // Create session
    const session = await prisma.chatSession.create({
      data: {
        userId,
        mode,
        title: title || `${mode === 'COUNCIL' ? 'Conselho' : 'Decisão'} com ${characters.length} personagens`
      }
    });

    // Create participants in specified order
    const participants = await Promise.all(
      characterKeys.map((characterKey, index) => {
        const character = characters.find(c => c.key === characterKey);
        return prisma.chatParticipant.create({
          data: {
            sessionId: session.id,
            characterId: character.id,
            orderIndex: index
          },
          include: {
            character: {
              select: {
                key: true,
                name: true,
                avatarUrl: true,
                styleTags: true
              }
            }
          }
        });
      })
    );

    logger.info(`Session created successfully: ${session.id}`);

    return sendSuccess(res, {
      session: {
        id: session.id,
        mode: session.mode,
        title: session.title,
        closed: session.closed,
        createdAt: session.createdAt,
        participants: participants.map(p => ({
          character: p.character,
          orderIndex: p.orderIndex
        }))
      }
    }, 'Chat session created successfully', 201);

  } catch (error) {
    logger.error('Error in createSession:', error);
    next(error);
  }
};

/**
 * Get user's chat sessions with pagination
 */
export const getSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 20 } = req.query;

    logger.info(`Fetching sessions for user ${userId}, page ${page}`);

    // Count total sessions
    const totalCount = await prisma.chatSession.count({
      where: { userId }
    });

    const pagination = getPaginationData(page, pageSize, totalCount);

    // Fetch sessions with participants and last message
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      include: {
        participants: {
          include: {
            character: {
              select: {
                key: true,
                name: true,
                avatarUrl: true
              }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            role: true,
            authorName: true
          }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip: pagination.offset,
      take: pagination.limit
    });

    const formattedSessions = sessions.map(session => ({
      id: session.id,
      mode: session.mode,
      title: session.title,
      closed: session.closed,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session._count.messages,
      participants: session.participants.map(p => p.character),
      lastMessage: session.messages[0] || null
    }));

    logger.info(`Found ${sessions.length} sessions for user ${userId}`);

    return sendSuccess(res, buildPaginationResponse(formattedSessions, pagination), 'Sessions retrieved successfully');

  } catch (error) {
    logger.error('Error in getSessions:', error);
    next(error);
  }
};

/**
 * Get session details with messages
 */
export const getSession = async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;
    const userId = req.user.id;
    const { cursor, limit = 30 } = req.query;

    logger.info(`Fetching session ${sessionId} for user ${userId}`);

    // Get session
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId
      },
      include: {
        participants: {
          include: {
            character: {
              select: {
                key: true,
                name: true,
                avatarUrl: true,
                styleTags: true
              }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!session) {
      throw new NotFoundError('Chat session');
    }

    // Build message query
    let messageWhere = {
      sessionId,
      role: { not: 'SYSTEM' } // Exclude system messages from chat display
    };

    // Handle cursor-based pagination
    if (cursor) {
      const cursorData = parseMessageCursor(cursor);
      if (cursorData) {
        messageWhere.OR = [
          {
            createdAt: { lt: cursorData.timestamp }
          },
          {
            createdAt: cursorData.timestamp,
            id: { lt: cursorData.id }
          }
        ];
      }
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: messageWhere,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: parseInt(limit),
      select: {
        id: true,
        role: true,
        authorKey: true,
        authorName: true,
        content: true,
        meta: true,
        createdAt: true
      }
    });

    // Reverse to show chronological order
    messages.reverse();

    // Create next cursor if there are more messages
    let nextCursor = null;
    if (messages.length === parseInt(limit)) {
      const oldestMessage = messages[0];
      nextCursor = Buffer.from(`${oldestMessage.createdAt.getTime()}-${oldestMessage.id}`).toString('base64');
    }

    const sessionData = {
      id: session.id,
      mode: session.mode,
      title: session.title,
      closed: session.closed,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      participants: session.participants.map(p => ({
        character: p.character,
        orderIndex: p.orderIndex
      })),
      messages,
      pagination: {
        nextCursor,
        hasMore: nextCursor !== null
      }
    };

    logger.info(`Retrieved session ${sessionId} with ${messages.length} messages`);

    return sendSuccess(res, { session: sessionData }, 'Session retrieved successfully');

  } catch (error) {
    logger.error('Error in getSession:', error);
    next(error);
  }
};

/**
 * Send message to session
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;
    const { content, stream = false } = req.body;
    const userId = req.user.id;

    logger.info(`Sending message to session ${sessionId}, stream: ${stream}`);

    // Get session
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId,
        closed: false
      }
    });

    if (!session) {
      throw new NotFoundError('Chat session or session is closed');
    }

    // Moderate content
    const moderation = await moderateContent(content);
    if (moderation.flagged) {
      throw new ValidationError('Content violates community guidelines');
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        sessionId,
        role: 'USER',
        content,
        meta: {
          moderation: moderation.categories
        }
      }
    });

    logger.info(`User message saved: ${userMessage.id}`);

    // Handle streaming response
    if (stream) {
      // For streaming, we need to handle the response differently
      // Set appropriate headers for SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      try {
        // Orchestrate chat with streaming
        const result = await orchestrateChat({
          session,
          userInput: content,
          stream: true,
          res
        });

        // Send final success event
        sendSSEEvent(res, 'complete', {
          success: true,
          mode: result.mode,
          suggested_topics: result.suggested_topics || []
        });

      } catch (error) {
        sendSSEError(res, error);
      } finally {
        closeSSE(res);
      }
    } else {
      // Non-streaming response
      const result = await orchestrateChat({
        session,
        userInput: content,
        stream: false
      });

      // Update session timestamp
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() }
      });

      return sendSuccess(res, result, 'Message processed successfully');
    }

  } catch (error) {
    logger.error('Error in sendMessage:', error);
    if (!res.headersSent) {
      next(error);
    }
  }
};

/**
 * Rename session
 */
export const renameSession = async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    logger.info(`Renaming session ${sessionId} to: ${title}`);

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId
      }
    });

    if (!session) {
      throw new NotFoundError('Chat session');
    }

    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title }
    });

    return sendSuccess(res, {
      session: {
        id: updatedSession.id,
        title: updatedSession.title
      }
    }, 'Session renamed successfully');

  } catch (error) {
    logger.error('Error in renameSession:', error);
    next(error);
  }
};

/**
 * Close session
 */
export const closeSession = async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;
    const userId = req.user.id;

    logger.info(`Closing session ${sessionId}`);

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId
      }
    });

    if (!session) {
      throw new NotFoundError('Chat session');
    }

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { closed: true }
    });

    return sendSuccess(res, {}, 'Session closed successfully');

  } catch (error) {
    logger.error('Error in closeSession:', error);
    next(error);
  }
};

/**
 * Delete session
 */
export const deleteSession = async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;
    const userId = req.user.id;

    logger.info(`Deleting session ${sessionId}`);

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId
      }
    });

    if (!session) {
      throw new NotFoundError('Chat session');
    }

    // Delete session and all related data (cascade will handle messages and participants)
    await prisma.chatSession.delete({
      where: { id: sessionId }
    });

    logger.info(`Session deleted successfully: ${sessionId}`);

    return sendSuccess(res, {}, 'Session deleted successfully');

  } catch (error) {
    logger.error('Error in deleteSession:', error);
    next(error);
  }
};

/**
 * Get session suggestions/topics
 */
export const getSessionSuggestions = async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;
    const userId = req.user.id;

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId
      }
    });

    if (!session) {
      throw new NotFoundError('Chat session');
    }

    // Get latest system message with suggestions
    const systemMessage = await prisma.message.findFirst({
      where: {
        sessionId,
        role: 'SYSTEM',
        meta: {
          path: ['suggested_topics'],
          not: null
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const suggestions = systemMessage?.meta?.suggested_topics || [];

    return sendSuccess(res, {
      suggestions,
      sessionId
    }, 'Suggestions retrieved successfully');

  } catch (error) {
    logger.error('Error in getSessionSuggestions:', error);
    next(error);
  }
};
