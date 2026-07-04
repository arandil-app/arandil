import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './lib/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import logger from './lib/logger.js';
import healthRouter from './routes/health.js';
import practiceRouter from './routes/practice.js';

// ─── App + middleware ──────────────────────────────────────────────────────

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? ['https://arandil.app', 'https://api.arandil.app'] : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rutas ──────────────────────────────────────────────────────────────────

app.use('/', healthRouter);
app.use('/practice', practiceRouter);

app.use(notFound);
app.use(errorHandler);

// ─── Server start ───────────────────────────────────────────────────────────

app.listen(env.PORT, '0.0.0.0', () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, '[api] Server started');
});

// ─── Shutdown ───────────────────────────────────────────────────────────────

process.on('SIGTERM', () => {
  logger.info('[api] SIGTERM received, shutting down gracefully');
  process.exit(0);
});
