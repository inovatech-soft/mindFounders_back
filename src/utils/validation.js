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
