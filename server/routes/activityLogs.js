import express from 'express';
import * as activityLogController from '../controllers/activityLogController.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/', authorizeRoles('Admin', 'HR'), activityLogController.getActivityLogs);

export default router;
