import express from 'express';
import * as queriesController from '../controllers/queriesController.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createQuerySchema, replyQuerySchema } from '../validators/queryValidator.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/', queriesController.getQueries);
router.post('/', validate(createQuerySchema), queriesController.createQuery);
router.patch('/:id/reply', authorizeRoles('Admin', 'HR'), validate(replyQuerySchema), queriesController.replyQuery);

export default router;
