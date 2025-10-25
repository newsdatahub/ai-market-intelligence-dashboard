import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import newsRouter from './routes/news';
import intelligenceRouter from './routes/intelligence';
import { validateEnvironmentVariables, logConfiguration, PORT } from './config/env';
import { logger } from './utils/logger';

// Validate required environment variables before starting the server
try {
  const missingVars = validateEnvironmentVariables();
  if (missingVars.length > 0) {
    logger.warn(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please ensure these variables are set in your .env file or environment.'
    );
  }
  logConfiguration();
} catch (error) {
  logger.error('Environment validation failed:', { error: error instanceof Error ? error.message : error });
  process.exit(1);
}

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/news', newsRouter);
app.use('/api/intelligence', intelligenceRouter);

app.listen(PORT, () => {
  logger.info(`✅ Backend server listening on port ${PORT}`);
  logger.info(`📡 Health check available at http://localhost:${PORT}/api/health`);
});
