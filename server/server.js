import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import logger from './config/logger.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import employeeRoutes from './routes/employees.js';
import projectRoutes from './routes/projects.js';
import departmentRoutes from './routes/departments.js';
import roleRoutes from './routes/roles.js';
import reportRoutes from './routes/reports.js';
import notificationRoutes from './routes/notifications.js';
import queryRoutes from './routes/queries.js';
import activityLogRoutes from './routes/activityLogs.js';
import searchRoutes from './routes/search.js';
import uploadRoutes from './routes/uploads.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://petaltask.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. Postman, mobile app) or dev mode without origin
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed === '*')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy violation: Origin '${origin}' is not allowed by Access-Control-Allow-Origin.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
}));

app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. Global Rate Limiter
app.use('/api', apiLimiter);

// 3. Static Directory for File Uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 4. Request Logging Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

import { checkDatabaseHealth } from './config/db.js';

// 5. Health Check Endpoint (Both /health and /api/health for Railway & Netlify)
app.get(['/health', '/api/health'], async (req, res) => {
  const isDbConnected = await checkDatabaseHealth();
  const status = isDbConnected ? 200 : 503;
  res.status(status).json({
    status: isDbConnected ? 'ok' : 'error',
    success: isDbConnected,
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 6. REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/uploads', uploadRoutes);

// 7. Global Centralized Error Handler
app.use(errorHandler);

// 8. Serve Built Frontend Client in Production
const distPath = path.join(process.cwd(), '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🌸 Petals Automation Enterprise SaaS REST API running on port ${PORT}`);
});

export default app;
