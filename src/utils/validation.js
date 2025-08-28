import Joi from 'joi';

/**
 * User registration validation schema
 */
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'Nome é obrigatório',
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 50 caracteres',
    }),

  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email é obrigatório',
      'string.email': 'Email deve ter um formato válido',
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Senha é obrigatória',
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'string.max': 'Senha deve ter no máximo 128 caracteres',
    }),
});

/**
 * User login validation schema
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email é obrigatório',
      'string.email': 'Email deve ter um formato válido',
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Senha é obrigatória',
    }),
});

/**
 * User profile update validation schema
 */
export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 50 caracteres',
    }),

  avatar: Joi.string()
    .uri()
    .allow('', null)
    .messages({
      'string.uri': 'Avatar deve ser uma URL válida',
    }),

  favorites: Joi.alternatives().try(
    // Accept array of strings
    Joi.array()
      .items(Joi.string().trim().min(1))
      .max(10)
      .messages({
        'array.max': 'Máximo 10 personagens favoritos permitidos',
        'string.min': 'Nome do personagem não pode estar vazio',
      }),
    // Accept JSON string
    Joi.string()
      .custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            throw new Error('Must be an array');
          }
          if (parsed.length > 10) {
            throw new Error('Maximum 10 favorites allowed');
          }
          return value;
        } catch (error) {
          return helpers.error('string.custom', { message: 'Favoritos deve ser um array válido (JSON)' });
        }
      })
  ).messages({
    'alternatives.match': 'Favoritos deve ser um array de strings ou JSON válido',
  }),

  responseStyle: Joi.string()
    .valid('BREVE', 'DETALHADA', 'ESPIRITUAL', 'PRATICA')
    .messages({
      'any.only': 'Estilo de resposta deve ser: BREVE, DETALHADA, ESPIRITUAL ou PRATICA',
    }),
});

/**
 * Favorites validation schema (for dedicated endpoint)
 */
export const favoritesSchema = Joi.object({
  favorites: Joi.array()
    .items(Joi.string().trim().min(1).max(50))
    .max(10)
    .required()
    .messages({
      'array.base': 'Favoritos deve ser um array',
      'array.max': 'Máximo 10 personagens favoritos permitidos',
      'string.min': 'Nome do personagem não pode estar vazio',
      'string.max': 'Nome do personagem deve ter no máximo 50 caracteres',
      'any.required': 'Lista de favoritos é obrigatória',
    }),
});

/**
 * Response style validation schema (for dedicated endpoint)
 */
export const responseStyleSchema = Joi.object({
  responseStyle: Joi.string()
    .valid('BREVE', 'DETALHADA', 'ESPIRITUAL', 'PRATICA')
    .required()
    .messages({
      'any.only': 'Estilo de resposta deve ser: BREVE, DETALHADA, ESPIRITUAL ou PRATICA',
      'any.required': 'Estilo de resposta é obrigatório',
    }),
});

/**
 * Questionnaire validation schema - MindFounders
 */
export const questionnaireSchema = Joi.object({
  // 1. Qual é sua faixa etária?
  ageRange: Joi.string()
    .valid('menos-18', '18-25', '26-35', '36-50', '51-65', 'mais-65')
    .required()
    .messages({
      'any.only': 'Faixa etária deve ser: menos-18, 18-25, 26-35, 36-50, 51-65, mais-65',
      'any.required': 'Faixa etária é obrigatória',
    }),

  // 2. Qual é sua situação atual?
  currentSituation: Joi.string()
    .valid('estudante', 'inicio-carreira', 'profissional-consolidado', 'empreendedor', 'aposentado', 'outro')
    .required()
    .messages({
      'any.only': 'Situação atual deve ser: estudante, inicio-carreira, profissional-consolidado, empreendedor, aposentado, outro',
      'any.required': 'Situação atual é obrigatória',
    }),

  // 3. Com que frequência você sente ansiedade?
  anxietyFrequency: Joi.string()
    .valid('quase-nunca', 'as-vezes', 'frequentemente', 'quase-todos-dias')
    .required()
    .messages({
      'any.only': 'Frequência de ansiedade deve ser: quase-nunca, as-vezes, frequentemente, quase-todos-dias',
      'any.required': 'Frequência de ansiedade é obrigatória',
    }),

  // 4. Como você lida com sentimentos de tristeza? (múltipla escolha)
  sadnessHandling: Joi.array()
    .items(Joi.string().valid('conversar-familia-amigos', 'distrair-filmes-jogos', 'esportes-atividade-fisica', 'terapia-ajuda-profissional', 'guardar-nao-compartilhar'))
    .min(1)
    .max(5)
    .required()
    .messages({
      'array.min': 'Selecione pelo menos uma forma de lidar com tristeza',
      'array.max': 'Selecione no máximo 5 formas de lidar com tristeza',
      'any.only': 'Opções válidas: conversar-familia-amigos, distrair-filmes-jogos, esportes-atividade-fisica, terapia-ajuda-profissional, guardar-nao-compartilhar',
      'any.required': 'Formas de lidar com tristeza são obrigatórias',
    }),

  // 5. Como você descreveria sua vida social?
  socialLife: Joi.string()
    .valid('muito-ativa-muitos-amigos', 'circulo-pequeno-proximo', 'mais-online-que-presencial', 'isolado-solitario')
    .required()
    .messages({
      'any.only': 'Vida social deve ser: muito-ativa-muitos-amigos, circulo-pequeno-proximo, mais-online-que-presencial, isolado-solitario',
      'any.required': 'Vida social é obrigatória',
    }),

  // 6. Em relacionamentos amorosos, você tende a:
  loveRelationships: Joi.string()
    .valid('aberto-demonstrar-afeto', 'reservado-racional', 'dificuldade-confiar', 'envolver-intenso-afastar', 'sem-experiencia-recente')
    .required()
    .messages({
      'any.only': 'Relacionamentos amorosos devem ser: aberto-demonstrar-afeto, reservado-racional, dificuldade-confiar, envolver-intenso-afastar, sem-experiencia-recente',
      'any.required': 'Relacionamentos amorosos são obrigatórios',
    }),

  // 7. Como você se sente em relação ao seu trabalho ou estudos?
  workFeeling: Joi.string()
    .valid('realizado-motivado', 'neutro-obrigacao', 'estressado-cansado', 'busca-algo-novo', 'nao-trabalho-estudo')
    .required()
    .messages({
      'any.only': 'Sentimento sobre trabalho deve ser: realizado-motivado, neutro-obrigacao, estressado-cansado, busca-algo-novo, nao-trabalho-estudo',
      'any.required': 'Sentimento sobre trabalho é obrigatório',
    }),

  // 8. O que mais te motiva no dia a dia? (múltipla escolha)
  motivation: Joi.array()
    .items(Joi.string().valid('crescimento-pessoal', 'reconhecimento-social', 'estabilidade-financeira', 'amor-relacionamentos', 'criatividade-inovacao'))
    .min(1)
    .max(5)
    .required()
    .messages({
      'array.min': 'Selecione pelo menos uma motivação',
      'array.max': 'Selecione no máximo 5 motivações',
      'any.only': 'Opções válidas: crescimento-pessoal, reconhecimento-social, estabilidade-financeira, amor-relacionamentos, criatividade-inovacao',
      'any.required': 'Motivações são obrigatórias',
    }),

  // 9. Como você organiza sua rotina diária?
  routine: Joi.string()
    .valid('muito-estruturada-horarios-fixos', 'moderadamente-organizada', 'improvisada-vivendo-dia', 'bagunçada-sem-rotina')
    .required()
    .messages({
      'any.only': 'Rotina deve ser: muito-estruturada-horarios-fixos, moderadamente-organizada, improvisada-vivendo-dia, bagunçada-sem-rotina',
      'any.required': 'Rotina é obrigatória',
    }),

  // 10. Qual é a sua relação com sono?
  sleep: Joi.string()
    .valid('durmo-bem-acordo-descansado', 'durmo-pouco-consigo-funcionar', 'insonia-sono-agitado', 'durmo-demais-ainda-cansado')
    .required()
    .messages({
      'any.only': 'Qualidade do sono deve ser: durmo-bem-acordo-descansado, durmo-pouco-consigo-funcionar, insonia-sono-agitado, durmo-demais-ainda-cansado',
      'any.required': 'Qualidade do sono é obrigatória',
    }),

  // 11. Qual dessas frases mais combina com você? (múltipla escolha)
  selfKnowledgeGoal: Joi.array()
    .items(Joi.string().valid('entender-melhor-emocoes', 'melhorar-relacionamentos', 'lidar-ansiedade-estresse', 'encontrar-proposito-vida', 'aprender-gostar-mais-mim'))
    .min(1)
    .max(5)
    .required()
    .messages({
      'array.min': 'Selecione pelo menos um objetivo de autoconhecimento',
      'array.max': 'Selecione no máximo 5 objetivos de autoconhecimento',
      'any.only': 'Opções válidas: entender-melhor-emocoes, melhorar-relacionamentos, lidar-ansiedade-estresse, encontrar-proposito-vida, aprender-gostar-mais-mim',
      'any.required': 'Objetivos de autoconhecimento são obrigatórios',
    }),

  // 12. O que você valoriza mais em uma pessoa? (múltipla escolha)
  values: Joi.array()
    .items(Joi.string().valid('honestidade', 'inteligencia', 'lealdade', 'criatividade', 'sensibilidade'))
    .min(1)
    .max(5)
    .required()
    .messages({
      'array.min': 'Selecione pelo menos um valor',
      'array.max': 'Selecione no máximo 5 valores',
      'any.only': 'Opções válidas: honestidade, inteligencia, lealdade, criatividade, sensibilidade',
      'any.required': 'Valores são obrigatórios',
    }),

  // 13. Qual é seu maior desafio atual?
  challenge: Joi.string()
    .valid('equilibrar-trabalho-vida-pessoal', 'manter-relacionamentos-saudaveis', 'controlar-emocoes', 'encontrar-proposito-direcao', 'superar-solidao-baixa-autoestima')
    .required()
    .messages({
      'any.only': 'Maior desafio deve ser: equilibrar-trabalho-vida-pessoal, manter-relacionamentos-saudaveis, controlar-emocoes, encontrar-proposito-direcao, superar-solidao-baixa-autoestima',
      'any.required': 'Maior desafio é obrigatório',
    }),

  // 14. Você acredita que sua infância influencia muito quem você é hoje?
  childhoodInfluence: Joi.string()
    .valid('sim-totalmente', 'sim-em-parte', 'nao-muito', 'nao-acredito-influencia')
    .required()
    .messages({
      'any.only': 'Influência da infância deve ser: sim-totalmente, sim-em-parte, nao-muito, nao-acredito-influencia',
      'any.required': 'Influência da infância é obrigatória',
    }),
});

/**
 * Questionnaire update validation schema (all fields optional) - MindFounders
 */
export const questionnaireUpdateSchema = Joi.object({
  // 1. Qual é sua faixa etária?
  ageRange: Joi.string()
    .valid('menos-18', '18-25', '26-35', '36-50', '51-65', 'mais-65')
    .messages({
      'any.only': 'Faixa etária deve ser: menos-18, 18-25, 26-35, 36-50, 51-65, mais-65',
    }),

  // 2. Qual é sua situação atual?
  currentSituation: Joi.string()
    .valid('estudante', 'inicio-carreira', 'profissional-consolidado', 'empreendedor', 'aposentado', 'outro')
    .messages({
      'any.only': 'Situação atual deve ser: estudante, inicio-carreira, profissional-consolidado, empreendedor, aposentado, outro',
    }),

  // 3. Com que frequência você sente ansiedade?
  anxietyFrequency: Joi.string()
    .valid('quase-nunca', 'as-vezes', 'frequentemente', 'quase-todos-dias')
    .messages({
      'any.only': 'Frequência de ansiedade deve ser: quase-nunca, as-vezes, frequentemente, quase-todos-dias',
    }),

  // 4. Como você lida com sentimentos de tristeza? (múltipla escolha)
  sadnessHandling: Joi.array()
    .items(Joi.string().valid('conversar-familia-amigos', 'distrair-filmes-jogos', 'esportes-atividade-fisica', 'terapia-ajuda-profissional', 'guardar-nao-compartilhar'))
    .min(1)
    .max(5)
    .messages({
      'array.min': 'Selecione pelo menos uma forma de lidar com tristeza',
      'array.max': 'Selecione no máximo 5 formas de lidar com tristeza',
      'any.only': 'Opções válidas: conversar-familia-amigos, distrair-filmes-jogos, esportes-atividade-fisica, terapia-ajuda-profissional, guardar-nao-compartilhar',
    }),

  // 5. Como você descreveria sua vida social?
  socialLife: Joi.string()
    .valid('muito-ativa-muitos-amigos', 'circulo-pequeno-proximo', 'mais-online-que-presencial', 'isolado-solitario')
    .messages({
      'any.only': 'Vida social deve ser: muito-ativa-muitos-amigos, circulo-pequeno-proximo, mais-online-que-presencial, isolado-solitario',
    }),

  // 6. Em relacionamentos amorosos, você tende a:
  loveRelationships: Joi.string()
    .valid('aberto-demonstrar-afeto', 'reservado-racional', 'dificuldade-confiar', 'envolver-intenso-afastar', 'sem-experiencia-recente')
    .messages({
      'any.only': 'Relacionamentos amorosos devem ser: aberto-demonstrar-afeto, reservado-racional, dificuldade-confiar, envolver-intenso-afastar, sem-experiencia-recente',
    }),

  // 7. Como você se sente em relação ao seu trabalho ou estudos?
  workFeeling: Joi.string()
    .valid('realizado-motivado', 'neutro-obrigacao', 'estressado-cansado', 'busca-algo-novo', 'nao-trabalho-estudo')
    .messages({
      'any.only': 'Sentimento sobre trabalho deve ser: realizado-motivado, neutro-obrigacao, estressado-cansado, busca-algo-novo, nao-trabalho-estudo',
    }),

  // 8. O que mais te motiva no dia a dia? (múltipla escolha)
  motivation: Joi.array()
    .items(Joi.string().valid('crescimento-pessoal', 'reconhecimento-social', 'estabilidade-financeira', 'amor-relacionamentos', 'criatividade-inovacao'))
    .min(1)
    .max(5)
    .messages({
      'array.min': 'Selecione pelo menos uma motivação',
      'array.max': 'Selecione no máximo 5 motivações',
      'any.only': 'Opções válidas: crescimento-pessoal, reconhecimento-social, estabilidade-financeira, amor-relacionamentos, criatividade-inovacao',
    }),

  // 9. Como você organiza sua rotina diária?
  routine: Joi.string()
    .valid('muito-estruturada-horarios-fixos', 'moderadamente-organizada', 'improvisada-vivendo-dia', 'bagunçada-sem-rotina')
    .messages({
      'any.only': 'Rotina deve ser: muito-estruturada-horarios-fixos, moderadamente-organizada, improvisada-vivendo-dia, bagunçada-sem-rotina',
    }),

  // 10. Qual é a sua relação com sono?
  sleep: Joi.string()
    .valid('durmo-bem-acordo-descansado', 'durmo-pouco-consigo-funcionar', 'insonia-sono-agitado', 'durmo-demais-ainda-cansado')
    .messages({
      'any.only': 'Qualidade do sono deve ser: durmo-bem-acordo-descansado, durmo-pouco-consigo-funcionar, insonia-sono-agitado, durmo-demais-ainda-cansado',
    }),

  // 11. Qual dessas frases mais combina com você? (múltipla escolha)
  selfKnowledgeGoal: Joi.array()
    .items(Joi.string().valid('entender-melhor-emocoes', 'melhorar-relacionamentos', 'lidar-ansiedade-estresse', 'encontrar-proposito-vida', 'aprender-gostar-mais-mim'))
    .min(1)
    .max(5)
    .messages({
      'array.min': 'Selecione pelo menos um objetivo de autoconhecimento',
      'array.max': 'Selecione no máximo 5 objetivos de autoconhecimento',
      'any.only': 'Opções válidas: entender-melhor-emocoes, melhorar-relacionamentos, lidar-ansiedade-estresse, encontrar-proposito-vida, aprender-gostar-mais-mim',
    }),

  // 12. O que você valoriza mais em uma pessoa? (múltipla escolha)
  values: Joi.array()
    .items(Joi.string().valid('honestidade', 'inteligencia', 'lealdade', 'criatividade', 'sensibilidade'))
    .min(1)
    .max(5)
    .messages({
      'array.min': 'Selecione pelo menos um valor',
      'array.max': 'Selecione no máximo 5 valores',
      'any.only': 'Opções válidas: honestidade, inteligencia, lealdade, criatividade, sensibilidade',
    }),

  // 13. Qual é seu maior desafio atual?
  challenge: Joi.string()
    .valid('equilibrar-trabalho-vida-pessoal', 'manter-relacionamentos-saudaveis', 'controlar-emocoes', 'encontrar-proposito-direcao', 'superar-solidao-baixa-autoestima')
    .messages({
      'any.only': 'Maior desafio deve ser: equilibrar-trabalho-vida-pessoal, manter-relacionamentos-saudaveis, controlar-emocoes, encontrar-proposito-direcao, superar-solidao-baixa-autoestima',
    }),

  // 14. Você acredita que sua infância influencia muito quem você é hoje?
  childhoodInfluence: Joi.string()
    .valid('sim-totalmente', 'sim-em-parte', 'nao-muito', 'nao-acredito-influencia')
    .messages({
      'any.only': 'Influência da infância deve ser: sim-totalmente, sim-em-parte, nao-muito, nao-acredito-influencia',
    }),
});
