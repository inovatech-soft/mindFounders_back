import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import questionnaireRoutes from './questionnaireRoutes.js';
import preferencesRoutes from './preferencesRoutes.js';
import characterRoutes from './characterRoutes.js';
import chatRoutes from './chatRoutes.js';
import oracaoRoutes from './oracaoRoutes.js';
import estudoRoutes from './estudoRoutes.js';
import diarioFeRoutes from './diarioFeRoutes.js';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/user/questionnaire', questionnaireRoutes);
router.use('/user/preferences', preferencesRoutes);
router.use('/characters', characterRoutes);
router.use('/chat', chatRoutes);

// Spiritual features routes
router.use('/prayers', oracaoRoutes);
router.use('/studies', estudoRoutes);
router.use('/diary', diarioFeRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mind Chat API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
