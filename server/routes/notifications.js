import express from 'express';
import * as notificationsController from '../controllers/notificationsController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/', notificationsController.getNotifications);
router.patch('/mark-read', notificationsController.markAllRead);
router.delete('/:id', notificationsController.deleteNotification);

export default router;
