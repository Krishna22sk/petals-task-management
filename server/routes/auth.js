import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authenticateJWT, authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authenticateJWT, authController.getCurrentUser);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/change-password', authenticateJWT, validate(changePasswordSchema), authController.changePassword);
router.put('/profile', authenticateJWT, authController.updateProfile);

export default router;
