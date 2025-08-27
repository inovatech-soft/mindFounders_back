import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

/**
 * Security middleware
 */
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
}));

/**
 * CORS configuration
 */
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request logging in development
 */
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

/**
 * API Routes
 */
app.use('/api', routes);

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mind Chat API - Módulo de Autenticação e Perfil de Usuário',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
      },
      user: {
        profile: 'GET /api/user/profile',
        updateProfile: 'PUT /api/user/profile',
      },
    },
  });
});

/**
 * Error handling middleware
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start server
 */
const startServer = () => {
  try {
    app.listen(config.port, () => {
      console.log(`🚀 Mind Chat API started successfully`);
      console.log(`📍 Server running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API URL: http://localhost:${config.port}`);
      console.log(`💚 Health Check: http://localhost:${config.port}/api/health`);
      console.log('');
      console.log('Available endpoints:');
      console.log('  POST /api/auth/register   - Register new user');
      console.log('  POST /api/auth/login      - Login user');
      console.log('  GET  /api/user/profile    - Get user profile (protected)');
      console.log('  PUT  /api/user/profile    - Update user profile (protected)');
      console.log('  GET  /api/health          - Health check');
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();

export default app;
