// Load environment variables as early as possible
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import env from './config/env';
import logger from './config/logger';
import { sendError } from './utils/http';
import { AppError } from './utils/errors';

// Import routers
import healthRouter from './modules/health/router';
import authRouter from './modules/auth/router';
import profileRouter from './modules/profile/router';
import moodRouter from './modules/mood/router';

const app = express();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute for auth endpoints
  message: {
    error: {
      code: 'BAD_REQUEST',
      message: 'Too many authentication requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute for write operations
  message: {
    error: {
      code: 'BAD_REQUEST',
      message: 'Too many requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  }, 'Incoming request');
  next();
});

// Routes
app.use('/', healthRouter);
app.use('/', authLimiter, authRouter);
app.use('/', writeLimiter, profileRouter);
app.use('/', writeLimiter, moodRouter);

// 404 handler
app.use('*', (req, res) => {
  sendError(res, 'NOT_FOUND', 'Route not found', 404);
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ error, url: req.url, method: req.method }, 'Unhandled error');

  if (error instanceof AppError) {
    return sendError(res, error.code as any, error.message, error.statusCode, error.details);
  }

  // Handle Prisma errors
  if (error.code === 'P2002') {
    return sendError(res, 'CONFLICT', 'Resource already exists', 409);
  }

  if (error.code === 'P2025') {
    return sendError(res, 'NOT_FOUND', 'Resource not found', 404);
  }

  // Default error
  sendError(res, 'INTERNAL', 'Internal server error', 500);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Environment check log
console.log('🔧 Environment loaded:', {
  hasDb: !!process.env.DATABASE_URL,
  hasJwt: !!process.env.JWT_SECRET,
  hasAppleAudience: !!process.env.APPLE_AUDIENCE,
  hasAppleIssuer: !!process.env.APPLE_ISSUER,
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT
});

// Start server
const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, nodeEnv: env.NODE_ENV }, 'Server started');
});

export default app;
