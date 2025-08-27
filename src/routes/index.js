import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mind Chat API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
