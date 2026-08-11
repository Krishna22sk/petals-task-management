import express from 'express';
import * as departmentsController from '../controllers/departmentsController.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/', departmentsController.getDepartments);
router.post('/', authorizeRoles('Admin', 'HR'), departmentsController.createDepartment);
router.put('/:id', authorizeRoles('Admin', 'HR'), departmentsController.updateDepartment);
router.delete('/:id', authorizeRoles('Admin', 'HR'), departmentsController.deleteDepartment);

export default router;
