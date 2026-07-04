import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// Mock db client
const { mockQuery } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
}));

vi.mock('../db/client.js', () => ({
  getPool: () => ({ query: mockQuery }),
}));

// Import route after mock
const { default: healthRouter } = await import('../routes/health.js');

describe('GET /health', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 200 with status ok when DB is healthy', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

    const app = express();
    app.use('/', healthRouter);

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      service: 'arandil-api',
    });
    expect(res.body.timestamp).toBeDefined();
  });

  it('returns 503 when DB connection fails', async () => {
    mockQuery.mockRejectedValueOnce(new Error('Connection refused'));

    const app = express();
    app.use('/', healthRouter);

    const res = await request(app).get('/health');

    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({
      status: 'error',
      service: 'arandil-api',
    });
  });
});
