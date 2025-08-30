/**
 * Rate limiting middleware with proxy support
 * Handles X-Forwarded-For headers correctly in deployment environments
 */

import rateLimit from 'express-rate-limit';

/**
 * Create a rate limiter that works correctly behind proxies
 */
export function createRateLimiter(options = {}) {
  const defaultOptions = {
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    
    // Custom key generator that handles proxy scenarios
    keyGenerator: (req) => {
      // Try to get the real IP from various headers set by proxies
      const forwarded = req.headers['x-forwarded-for'];
      const realIp = req.headers['x-real-ip'];
      const cfConnectingIp = req.headers['cf-connecting-ip']; // Cloudflare
      
      // Use the first available IP
      let clientIp = req.ip || 
                    req.connection?.remoteAddress || 
                    req.socket?.remoteAddress ||
                    (req.connection?.socket ? req.connection.socket.remoteAddress : null);
      
      // If behind a proxy, use the forwarded IP
      if (forwarded) {
        clientIp = forwarded.split(',')[0].trim();
      } else if (realIp) {
        clientIp = realIp;
      } else if (cfConnectingIp) {
        clientIp = cfConnectingIp;
      }
      
      // Fallback to a default if we can't determine IP
      return clientIp || 'unknown';
    },
    
    // Skip rate limiting in development or if IP cannot be determined
    skip: (req) => {
      // Skip in development
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      
      // Skip if we can't reliably identify the user
      const hasValidIp = req.ip || 
                        req.headers['x-forwarded-for'] || 
                        req.headers['x-real-ip'] ||
                        req.connection?.remoteAddress;
      
      return !hasValidIp;
    },

    // Default error handler
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
        error: {
          type: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.round(res.getHeader('Retry-After')) || 60
        }
      });
    }
  };

  // Merge with custom options
  const finalOptions = { ...defaultOptions, ...options };

  return rateLimit(finalOptions);
}

/**
 * Pre-configured rate limiters for different scenarios
 */

// General API rate limiting
export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Authentication rate limiting (stricter)
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth attempts per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true // Don't count successful requests
});

// Chat rate limiting (moderate)
export const chatRateLimit = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // limit each IP to 30 chat requests per windowMs
  message: 'Too many chat requests, please slow down.'
});

// Message rate limiting (strict due to OpenAI costs)
export const messageRateLimit = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 messages per minute
  message: 'Too many messages, please slow down.'
});

// Character/resource rate limiting (lenient)
export const resourceRateLimit = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

export default createRateLimiter;
