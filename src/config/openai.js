/**
 * OpenAI Configuration and Client
 * Supports both Responses API and Chat Completions API with fallback
 */

import OpenAI from 'openai';
import config from './index.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// JSON Schema for structured responses
export const COUNCIL_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    mode: {
      type: "string",
      enum: ["COUNCIL"]
    },
    messages: {
      type: "array",
      items: {
        type: "object",
        properties: {
          characterKey: { type: "string" },
          characterName: { type: "string" },
          content: { type: "string" }
        },
        required: ["characterKey", "characterName", "content"]
      }
    },
    suggested_topics: {
      type: "array",
      items: { type: "string" },
      maxItems: 5
    }
  },
  required: ["mode", "messages"]
};

export const DECISION_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    mode: {
      type: "string",
      enum: ["DECISION"]
    },
    analyses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          characterKey: { type: "string" },
          characterName: { type: "string" },
          summary: { type: "string" }
        },
        required: ["characterKey", "characterName", "summary"]
      }
    },
    final_decision: {
      type: "object",
      properties: {
        title: { type: "string" },
        content: { type: "string" },
        rationale: { type: "string" }
      },
      required: ["title", "content", "rationale"]
    },
    suggested_topics: {
      type: "array",
      items: { type: "string" },
      maxItems: 5
    }
  },
  required: ["mode", "analyses", "final_decision"]
};

/**
 * Create structured text response using Responses API or Chat Completions fallback
 */
export async function createStructuredResponse({ 
  messages, 
  responseFormat, 
  stream = false,
  temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
  maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 1200,
  model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
}) {
  try {
    const useResponsesAPI = process.env.RESPONSES_API === 'true';

    if (useResponsesAPI) {
      // Use Responses API with structured output
      return await openai.chat.completions.create({
        model,
        messages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "structured_response",
            schema: responseFormat,
            strict: true
          }
        },
        temperature,
        max_tokens: maxTokens,
        stream
      });
    } else {
      // Fallback to regular Chat Completions
      const systemPrompt = `You must respond with valid JSON matching this exact schema: ${JSON.stringify(responseFormat, null, 2)}`;
      
      const enhancedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      return await openai.chat.completions.create({
        model,
        messages: enhancedMessages,
        temperature,
        max_tokens: maxTokens,
        stream
      });
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(`OpenAI request failed: ${error.message}`);
  }
}

/**
 * Create simple text completion
 */
export async function createTextCompletion({ 
  messages, 
  stream = false,
  temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
  maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 1200,
  model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
}) {
  try {
    return await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(`OpenAI request failed: ${error.message}`);
  }
}

/**
 * Moderate content using OpenAI Moderation API
 */
export async function moderateContent(input) {
  try {
    const moderation = await openai.moderations.create({
      input,
    });
    
    return {
      flagged: moderation.results[0].flagged,
      categories: moderation.results[0].categories,
      category_scores: moderation.results[0].category_scores
    };
  } catch (error) {
    console.error('Moderation API Error:', error);
    return { flagged: false, categories: {}, category_scores: {} };
  }
}

export default openai;
