import express from 'express';
import * as employeesController from '../controllers/employeesController.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/employeeValidator.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/', employeesController.getEmployees);
router.get('/:id', employeesController.getEmployeeById);
router.post('/', authorizeRoles('Admin', 'HR'), validate(createEmployeeSchema), employeesController.createEmployee);
router.put('/:id', authorizeRoles('Admin', 'HR'), validate(updateEmployeeSchema), employeesController.updateEmployee);
router.delete('/:id', authorizeRoles('Admin', 'HR'), employeesController.deleteEmployee);

export default router;
