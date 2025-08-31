/**
 * Zod validation schemas for chat-related requests
 */

import { z } from 'zod';

// Chat session creation schema
export const createSessionSchema = z.object({
  mode: z.enum(['COUNCIL', 'DECISION'], {
    required_error: 'Mode is required',
    invalid_type_error: 'Mode must be either COUNCIL or DECISION'
  }),
  characters: z.array(z.string().min(1, 'Character key cannot be empty'))
    .min(1, 'At least one character is required')
    .max(parseInt(process.env.CHAT_MAX_PARTICIPANTS) || 6, `Maximum ${process.env.CHAT_MAX_PARTICIPANTS || 6} characters allowed`),
  title: z.string().min(1).max(100).optional()
});

// Message creation schema
export const sendMessageSchema = z.object({
  content: z.string()
    .min(1, 'Message content cannot be empty')
    .max(2000, 'Message content too long (max 2000 characters)'),
  stream: z.boolean().optional().default(false)
});

// Session update schema
export const updateSessionSchema = z.object({
  title: z.string().min(1).max(100).optional()
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).max(100).optional().default(20),
  cursor: z.string().optional()
});

// Character creation schema (for admin)
export const createCharacterSchema = z.object({
  key: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Key must contain only lowercase letters, numbers, and hyphens'),
  name: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
  basePrompt: z.string().min(10).max(2000),
  styleTags: z.array(z.string().min(1).max(50)).optional().default([])
});

// Character update schema
export const updateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  basePrompt: z.string().min(10).max(2000).optional(),
  styleTags: z.array(z.string().min(1).max(50)).optional()
});

// Questionnaire response schema
export const questionnaireResponseSchema = z.object({
  responses: z.record(z.any()) // flexible object for questionnaire responses
});

// Preferences schemas
export const createPreferencesSchema = z.object({
  responseTone: z.enum(['breve', 'detalhada', 'espiritual', 'pratica']).default('detalhada')
});

export const updatePreferencesSchema = z.object({
  responseTone: z.enum(['breve', 'detalhada', 'espiritual', 'pratica']).optional()
});

export const updateNotificationsSchema = z.object({
  notificationEnabled: z.boolean().optional(),
  notificationType: z.enum(['daily', 'weekly']).optional(),
  notificationTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format').optional(),
  notificationDays: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional()
}).refine((data) => {
  // Se notificações estão habilitadas, deve ter tipo e horário
  if (data.notificationEnabled === true) {
    return data.notificationType && data.notificationTime;
  }
  // Se tipo é weekly, deve ter dias especificados
  if (data.notificationType === 'weekly') {
    return data.notificationDays && data.notificationDays.length > 0;
  }
  return true;
}, {
  message: "When notifications are enabled, type and time are required. For weekly notifications, days must be specified."
});

// Response validation schemas (for OpenAI responses)
export const councilResponseSchema = z.object({
  mode: z.literal('COUNCIL'),
  messages: z.array(z.object({
    characterKey: z.string(),
    characterName: z.string(),
    content: z.string().min(1)
  })),
  suggested_topics: z.array(z.string()).optional().default([])
});

export const decisionResponseSchema = z.object({
  mode: z.literal('DECISION'),
  analyses: z.array(z.object({
    characterKey: z.string(),
    characterName: z.string(),
    summary: z.string().min(1)
  })),
  final_decision: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    rationale: z.string().min(1)
  }),
  suggested_topics: z.array(z.string()).optional().default([])
});

/**
 * Middleware for validating request data with Zod
 */
export function validateRequest(schema, property = 'body') {
  return (req, res, next) => {
    try {
      const data = req[property];
      const result = schema.parse(data);
      req[property] = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}
