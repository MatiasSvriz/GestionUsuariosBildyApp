import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morganBody from 'morgan-body';
import mongoose from 'mongoose';

import apiRoutes from './routes/index.js';
import limiter from './middleware/rate-limit.js';
import { notFoundHandler, errorHandler } from './middleware/error-handler.js';
import { loggerStream } from './services/logger.service.js';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const app = express();

// Seguridad básica
app.use(helmet());

// CORS
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Rate limiting global
app.use(limiter);

// Parseo del body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Swagger 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Logging HTTP
morganBody(app, {
  noColors: true,
  skip: (req, res) => res.statusCode < 400,
  stream: loggerStream
});

// Archivos estáticos
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;

  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    status: 'ok',
    db: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Rutas principales
app.use('/api', apiRoutes);

// 404
app.use(notFoundHandler);

// Manejador global de errores
app.use(errorHandler);

export default app;