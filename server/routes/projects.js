import express from 'express';
import * as projectsController from '../controllers/projectsController.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createProjectSchema, updateProjectSchema } from '../validators/projectValidator.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/', projectsController.getProjects);
router.get('/:id', projectsController.getProjectById);
router.post('/', authorizeRoles('Admin', 'HR', 'Manager'), validate(createProjectSchema), projectsController.createProject);
router.put('/:id', authorizeRoles('Admin', 'HR', 'Manager'), validate(updateProjectSchema), projectsController.updateProject);
router.delete('/:id', authorizeRoles('Admin', 'HR'), projectsController.deleteProject);

export default router;
