import express from 'express';
import * as reportsController from '../controllers/reportsController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/dashboard', reportsController.getDashboardSummary);
router.get('/performance', reportsController.getEmployeePerformance);
router.get('/task-analytics', reportsController.getTaskAnalytics);
router.get('/project-analytics', reportsController.getProjectAnalytics);
router.get('/late-tasks', reportsController.getLateTasks);
router.get('/completed-tasks', reportsController.getCompletedTasks);
router.get('/upcoming-deadlines', reportsController.getUpcomingDeadlines);

export default router;
