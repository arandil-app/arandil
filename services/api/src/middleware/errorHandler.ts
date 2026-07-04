import type { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger.js';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.statusCode ?? 500;
  const message = status < 500 ? err.message : 'Internal server error';

  if (status >= 500) {
    logger.error({ err }, '[error] Unhandled server error');
  }

  res.status(status).json({ error: message });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}
