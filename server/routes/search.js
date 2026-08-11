import express from 'express';
import * as searchController from '../controllers/searchController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/', searchController.globalSearch);

export default router;
