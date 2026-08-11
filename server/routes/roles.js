import express from 'express';
import * as rolesController from '../controllers/rolesController.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/', rolesController.getRoles);
router.post('/', authorizeRoles('Admin'), rolesController.createRole);
router.put('/:id', authorizeRoles('Admin'), rolesController.updateRole);
router.delete('/:id', authorizeRoles('Admin'), rolesController.deleteRole);

export default router;
