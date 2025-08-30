import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import questionnaireRoutes from './questionnaireRoutes.js';
import characterRoutes from './characterRoutes.js';
import chatRoutes from './chatRoutes.js';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/user/questionnaire', questionnaireRoutes);
router.use('/characters', characterRoutes);
router.use('/chat', chatRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mind Chat API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
