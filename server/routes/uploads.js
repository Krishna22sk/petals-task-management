import express from 'express';
import * as uploadsController from '../controllers/uploadsController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import { upload } from '../config/upload.js';

const router = express.Router();

router.use(authenticateJWT);

router.post('/', upload.single('file'), uploadsController.uploadFile);

export default router;
