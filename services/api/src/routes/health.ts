import { Router } from 'express';
import { getPool } from '../db/client.js';

const router = Router();

router.get('/health', async (_req, res) => {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'arandil-api', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'error', service: 'arandil-api' });
  }
});

export default router;
