/**
 * Chat Orchestrator Service
 * Handles the main logic for COUNCIL and DECISION chat modes
 */

import { createStructuredResponse, COUNCIL_RESPONSE_SCHEMA, DECISION_RESPONSE_SCHEMA } from '../config/openai.js';
import { 
  buildUserContext, 
  buildCouncilPrompt, 
  buildDecisionPrompt, 
  buildOpenAIMessages 
} from './promptBuilder.js';
import { councilResponseSchema, decisionResponseSchema } from '../utils/zodValidation.js';
import { sendSSEEvent, sendSSEError } from '../utils/sse.js';
import { AppError, OpenAIError } from '../utils/errors.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Run Council mode - characters respond in sequence
 */
export async function runCouncil({ session, userInput, characters, messageHistory, userContext, stream = false, res = null }) {
  try {
    logger.info(`Running council mode for session ${session.id} with ${characters.length} characters`);

    // Build the council prompt
    const systemPrompt = buildCouncilPrompt(characters, messageHistory, userInput, userContext);
    const messages = buildOpenAIMessages(systemPrompt, userInput);

    if (stream && res) {
      sendSSEEvent(res, 'council_start', { 
        characters: characters.map(c => ({ key: c.key, name: c.name })) 
      });
    }

    // Generate structured response from OpenAI
    const completion = await createStructuredResponse({
      messages,
      responseFormat: COUNCIL_RESPONSE_SCHEMA,
      stream: false // Note: structured responses don't support streaming yet
    });

    let responseData;
    try {
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      responseData = JSON.parse(content);
      
      // Ensure suggested_topics is always present
      if (!responseData.suggested_topics || !Array.isArray(responseData.suggested_topics)) {
        responseData.suggested_topics = [
          "Desenvolvimento pessoal",
          "Relacionamentos familiares",
          "Propósito de vida"
        ];
      }
      
      // Validate with Zod
      const validatedResponse = councilResponseSchema.parse(responseData);
      responseData = validatedResponse;

    } catch (parseError) {
      logger.error('Failed to parse OpenAI response:', parseError);
      throw new OpenAIError('Failed to get structured response from AI');
    }

    // Save character messages to database
    const savedMessages = [];
    for (const msg of responseData.messages) {
      const character = characters.find(c => c.key === msg.characterKey);
      if (character) {
        const savedMessage = await prisma.message.create({
          data: {
            sessionId: session.id,
            role: 'CHARACTER',
            authorKey: character.key,
            authorName: character.name,
            content: msg.content,
            meta: {
              mode: 'COUNCIL',
              characterOrder: characters.findIndex(c => c.key === character.key)
            }
          }
        });
        savedMessages.push(savedMessage);

        if (stream && res) {
          sendSSEEvent(res, 'character_response', {
            characterKey: character.key,
            characterName: character.name,
            content: msg.content
          });
        }
      }
    }

    // Save suggested topics if any
    if (responseData.suggested_topics?.length > 0) {
      await prisma.message.create({
        data: {
          sessionId: session.id,
          role: 'SYSTEM',
          content: 'Suggested topics',
          meta: {
            suggested_topics: responseData.suggested_topics
          }
        }
      });
    }

    if (stream && res) {
      sendSSEEvent(res, 'council_complete', {
        suggested_topics: responseData.suggested_topics || []
      });
    }

    logger.info(`Council mode completed for session ${session.id}`);

    return {
      mode: 'COUNCIL',
      messages: responseData.messages,
      suggested_topics: responseData.suggested_topics || [],
      savedMessages
    };

  } catch (error) {
    logger.error('Error in runCouncil:', error);
    
    if (stream && res) {
      sendSSEError(res, error);
    }
    
    if (error instanceof OpenAIError) {
      throw error;
    }
    
    throw new AppError('Failed to process council session', 500);
  }
}

/**
 * Run Decision mode - characters provide analysis, then collaborative decision
 */
export async function runDecision({ session, userInput, characters, messageHistory, userContext, stream = false, res = null }) {
  try {
    logger.info(`Running decision mode for session ${session.id} with ${characters.length} characters`);

    // Build the decision prompt
    const systemPrompt = buildDecisionPrompt(characters, messageHistory, userInput, userContext);
    const messages = buildOpenAIMessages(systemPrompt, userInput);

    if (stream && res) {
      sendSSEEvent(res, 'decision_start', { 
        characters: characters.map(c => ({ key: c.key, name: c.name })) 
      });
    }

    // Generate structured response from OpenAI
    const completion = await createStructuredResponse({
      messages,
      responseFormat: DECISION_RESPONSE_SCHEMA,
      stream: false // Note: structured responses don't support streaming yet
    });

    let responseData;
    try {
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      responseData = JSON.parse(content);
      
      // Ensure suggested_topics is always present
      if (!responseData.suggested_topics || !Array.isArray(responseData.suggested_topics)) {
        responseData.suggested_topics = [
          "Próximos passos práticos",
          "Reflexões sobre a decisão",
          "Implementação das mudanças"
        ];
      }
      
      // Validate with Zod
      const validatedResponse = decisionResponseSchema.parse(responseData);
      responseData = validatedResponse;

    } catch (parseError) {
      logger.error('Failed to parse OpenAI response:', parseError);
      throw new OpenAIError('Failed to get structured response from AI');
    }

    // Save character analyses to database
    const savedAnalyses = [];
    for (const analysis of responseData.analyses) {
      const character = characters.find(c => c.key === analysis.characterKey);
      if (character) {
        const savedMessage = await prisma.message.create({
          data: {
            sessionId: session.id,
            role: 'CHARACTER',
            authorKey: character.key,
            authorName: character.name,
            content: analysis.summary,
            meta: {
              mode: 'DECISION',
              messageType: 'analysis',
              characterOrder: characters.findIndex(c => c.key === character.key)
            }
          }
        });
        savedAnalyses.push(savedMessage);

        if (stream && res) {
          sendSSEEvent(res, 'character_analysis', {
            characterKey: character.key,
            characterName: character.name,
            summary: analysis.summary
          });
        }
      }
    }

    // Save final decision
    const finalDecisionMessage = await prisma.message.create({
      data: {
        sessionId: session.id,
        role: 'SUMMARY',
        authorName: 'Conselho',
        content: responseData.final_decision.content,
        meta: {
          mode: 'DECISION',
          messageType: 'final_decision',
          title: responseData.final_decision.title,
          rationale: responseData.final_decision.rationale,
          suggested_topics: responseData.suggested_topics || []
        }
      }
    });

    if (stream && res) {
      sendSSEEvent(res, 'final_decision', {
        title: responseData.final_decision.title,
        content: responseData.final_decision.content,
        rationale: responseData.final_decision.rationale
      });
    }

    // Save suggested topics if any
    if (responseData.suggested_topics?.length > 0) {
      await prisma.message.create({
        data: {
          sessionId: session.id,
          role: 'SYSTEM',
          content: 'Suggested topics',
          meta: {
            suggested_topics: responseData.suggested_topics
          }
        }
      });
    }

    if (stream && res) {
      sendSSEEvent(res, 'decision_complete', {
        suggested_topics: responseData.suggested_topics || []
      });
    }

    logger.info(`Decision mode completed for session ${session.id}`);

    return {
      mode: 'DECISION',
      analyses: responseData.analyses,
      final_decision: responseData.final_decision,
      suggested_topics: responseData.suggested_topics || [],
      savedAnalyses,
      savedDecision: finalDecisionMessage
    };

  } catch (error) {
    logger.error('Error in runDecision:', error);
    
    if (stream && res) {
      sendSSEError(res, error);
    }
    
    if (error instanceof OpenAIError) {
      throw error;
    }
    
    throw new AppError('Failed to process decision session', 500);
  }
}

/**
 * Main orchestrator function that routes to appropriate mode
 */
export async function orchestrateChat({ session, userInput, stream = false, res = null }) {
  try {
    // Get session with participants and user data
    const fullSession = await prisma.chatSession.findUnique({
      where: { id: session.id },
      include: {
        participants: {
          include: {
            character: true
          },
          orderBy: { orderIndex: 'asc' }
        },
        user: {
          include: {
            questionnaire: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20 // Get recent message history
        }
      }
    });

    if (!fullSession) {
      throw new AppError('Session not found', 404);
    }

    const characters = fullSession.participants.map(p => p.character);
    const userContext = await buildUserContext(fullSession.user);
    const messageHistory = fullSession.messages;

    // Route to appropriate mode
    if (session.mode === 'COUNCIL') {
      return await runCouncil({
        session,
        userInput,
        characters,
        messageHistory,
        userContext,
        stream,
        res
      });
    } else if (session.mode === 'DECISION') {
      return await runDecision({
        session,
        userInput,
        characters,
        messageHistory,
        userContext,
        stream,
        res
      });
    } else {
      throw new AppError('Invalid session mode', 400);
    }

  } catch (error) {
    logger.error('Error in orchestrateChat:', error);
    throw error;
  }
}
