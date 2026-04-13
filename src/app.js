import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morganBody from 'morgan-body';
import { loggerStream } from './utils/handleLogger.js';
import userRoutes from './routes/user.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(helmet());

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

morganBody(app, {
  noColors: true,
  skip: (req, res) => res.statusCode < 400, // Solo errores
  stream: loggerStream
});

app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'API funcionando',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/user', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;