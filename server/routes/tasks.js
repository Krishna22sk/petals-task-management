import express from 'express';
import * as tasksController from '../controllers/tasksController.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { upload } from '../config/upload.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  updateTaskPrioritySchema,
  addCommentSchema,
} from '../validators/taskValidator.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/', tasksController.getTasks);
router.post('/', authorizeRoles('Admin', 'HR', 'Manager', 'Team Leader'), validate(createTaskSchema), tasksController.createTask);
router.get('/:id', tasksController.getTaskById);
router.put('/:id', validate(updateTaskSchema), tasksController.updateTask);
router.patch('/:id/status', validate(updateTaskStatusSchema), tasksController.updateTaskStatus);
router.patch('/:id/priority', validate(updateTaskPrioritySchema), tasksController.updateTaskPriority);
router.patch('/:id/assign', tasksController.updateTask);
router.delete('/:id', authorizeRoles('Admin', 'HR', 'Manager', 'Team Leader'), tasksController.deleteTask);

router.post('/:id/comments', validate(addCommentSchema), tasksController.addComment);
router.post('/:id/attachments', upload.single('file'), tasksController.addAttachment);
router.post('/:id/time-tracking', tasksController.trackTime);

export default router;
