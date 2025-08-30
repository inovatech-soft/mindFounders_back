/**
 * Prompt Builder Service
 * Constructs contextualized prompts based on user profile, questionnaire, and preferences
 */

import logger from '../utils/logger.js';

/**
 * Build user context from profile and questionnaire
 */
export function buildUserContext(user) {
  const context = {
    name: user.name,
    responseStyle: user.responseStyle || 'BREVE',
    favorites: [],
    language: 'pt-BR'
  };

  // Parse favorites if exists
  try {
    if (user.favorites) {
      context.favorites = JSON.parse(user.favorites);
    }
  } catch (error) {
    logger.warn('Failed to parse user favorites:', error);
    context.favorites = [];
  }

  // Add questionnaire context if available
  if (user.questionnaire) {
    const q = user.questionnaire;
    context.profile = {
      ageRange: q.ageRange,
      currentSituation: q.currentSituation,
      anxietyFrequency: q.anxietyFrequency,
      socialLife: q.socialLife,
      loveRelationships: q.loveRelationships,
      workFeeling: q.workFeeling,
      motivation: q.motivation,
      routine: q.routine,
      sleep: q.sleep,
      selfKnowledgeGoal: q.selfKnowledgeGoal,
      values: q.values,
      challenge: q.challenge,
      childhoodInfluence: q.childhoodInfluence,
      sadnessHandling: q.sadnessHandling
    };
  }

  return context;
}

/**
 * Get response style instructions based on user preference
 */
function getResponseStyleInstructions(responseStyle) {
  const styles = {
    BREVE: 'Mantenha suas respostas concisas e diretas, entre 2-3 parágrafos curtos. Vá direto ao ponto principal.',
    DETALHADA: 'Forneça respostas completas e bem explicadas, com exemplos práticos e contexto detalhado quando apropriado.',
    ESPIRITUAL: 'Enfatize aspectos espirituais, princípios bíblicos e crescimento da fé. Use linguagem reverente e inspiradora.',
    PRATICA: 'Foque em soluções práticas e passos concretos que a pessoa pode implementar imediatamente no dia a dia.'
  };

  return styles[responseStyle] || styles.BREVE;
}

/**
 * Build system prompt for a character with user context
 */
export function buildCharacterSystemPrompt(character, userContext) {
  const baseRules = `
REGRAS FUNDAMENTAIS:
- Responda SEMPRE em português brasileiro
- Use tom acolhedor, respeitoso e empático
- NUNCA forneça diagnósticos médicos ou psicológicos
- NUNCA prescreva medicamentos ou tratamentos médicos
- Quando o tema exigir, sugira buscar ajuda profissional qualificada
- Evite linguagem que possa causar culpa, vergonha ou julgamento
- Mantenha o foco na orientação, encorajamento e sabedoria prática
- Use linguagem clara e acessível
- Evite discursos longos ou pregação excessiva
  `;

  const styleInstructions = getResponseStyleInstructions(userContext.responseStyle);

  let contextualInfo = '';
  if (userContext.profile) {
    const profile = userContext.profile;
    contextualInfo = `
CONTEXTO DO USUÁRIO:
- Faixa etária: ${profile.ageRange}
- Situação atual: ${profile.currentSituation}
- Principais valores: ${profile.values?.join(', ') || 'Não informado'}
- Principais desafios: ${profile.challenge}
- Motivações: ${profile.motivation?.join(', ') || 'Não informado'}
- Objetivos de autoconhecimento: ${profile.selfKnowledgeGoal?.join(', ') || 'Não informado'}

Use estas informações para personalizar sua resposta e torná-la mais relevante.
    `;
  }

  const prompt = `${character.basePrompt}

${baseRules}

ESTILO DE RESPOSTA: ${styleInstructions}

${contextualInfo}

Seja autêntico ao seu personagem, mas sempre mantenha o foco no bem-estar e crescimento da pessoa.`;

  return prompt.trim();
}

/**
 * Build prompt for Council mode
 */
export function buildCouncilPrompt(characters, messageHistory, userInput, userContext) {
  const characterList = characters.map(char => `${char.name} (${char.key})`).join(', ');
  
  const historyText = messageHistory.length > 0 
    ? '\n\nHISTÓRICO DA CONVERSA:\n' + messageHistory.slice(-10).map(msg => {
        if (msg.role === 'USER') {
          return `Usuário: ${msg.content}`;
        } else if (msg.role === 'CHARACTER') {
          return `${msg.authorName}: ${msg.content}`;
        }
        return '';
      }).filter(Boolean).join('\n')
    : '';

  const systemPrompt = `Você está facilitando uma sessão de CONSELHO EM GRUPO com os seguintes personagens: ${characterList}.

INSTRUÇÕES:
1. Cada personagem deve responder de forma única, seguindo sua persona específica
2. As respostas devem ser complementares, não repetitivas
3. Mantenha a ordem estabelecida dos personagens
4. Cada resposta deve ter entre 100-300 palavras
5. Inclua até 3 tópicos sugeridos para continuar a conversa

FORMATO DE RESPOSTA: Retorne um JSON válido seguindo exatamente esta estrutura:
{
  "mode": "COUNCIL",
  "messages": [
    {"characterKey": "chave-do-personagem", "characterName": "Nome", "content": "resposta..."},
    ...
  ],
  "suggested_topics": ["tópico 1", "tópico 2", "tópico 3"]
}

${historyText}

NOVA PERGUNTA DO USUÁRIO: ${userInput}`;

  return systemPrompt;
}

/**
 * Build prompt for Decision mode
 */
export function buildDecisionPrompt(characters, messageHistory, userInput, userContext) {
  const characterList = characters.map(char => `${char.name} (${char.key})`).join(', ');
  
  const historyText = messageHistory.length > 0 
    ? '\n\nHISTÓRICO DA CONVERSA:\n' + messageHistory.slice(-10).map(msg => {
        if (msg.role === 'USER') {
          return `Usuário: ${msg.content}`;
        } else if (msg.role === 'CHARACTER') {
          return `${msg.authorName}: ${msg.content}`;
        } else if (msg.role === 'SUMMARY') {
          return `Decisão anterior: ${msg.content}`;
        }
        return '';
      }).filter(Boolean).join('\n')
    : '';

  const systemPrompt = `Você está facilitando uma sessão de DECISÃO EM GRUPO com os seguintes personagens: ${characterList}.

PROCESSO:
1. ANÁLISE: Cada personagem oferece uma análise curta (50-100 palavras) da situação
2. DECISÃO FINAL: Um moderador sintetiza uma resposta colaborativa baseada nas análises

INSTRUÇÕES:
- Cada análise deve capturar a perspectiva única do personagem
- A decisão final deve integrar as diferentes perspectivas de forma coerente
- Inclua justificativa clara para a decisão
- Mantenha tom respeitoso e encorajador
- Inclua até 3 tópicos sugeridos para continuar

FORMATO DE RESPOSTA: Retorne um JSON válido seguindo exatamente esta estrutura:
{
  "mode": "DECISION",
  "analyses": [
    {"characterKey": "chave", "characterName": "Nome", "summary": "análise..."},
    ...
  ],
  "final_decision": {
    "title": "Título da Decisão",
    "content": "Conteúdo da decisão...",
    "rationale": "Justificativa da decisão..."
  },
  "suggested_topics": ["tópico 1", "tópico 2", "tópico 3"]
}

${historyText}

SITUAÇÃO PARA DECISÃO: ${userInput}`;

  return systemPrompt;
}

/**
 * Build messages array for OpenAI API
 */
export function buildOpenAIMessages(systemPrompt, userInput) {
  return [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: userInput
    }
  ];
}
