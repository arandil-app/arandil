import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import practiceRouter from '../routes/practice.js';

// Mock dependencies
vi.mock('../db/client.js', () => ({
  getPool: vi.fn(() => ({
    query: vi.fn(),
  })),
}));

vi.mock('../middleware/auth.js', () => ({
  authMiddleware: vi.fn((req, _res, next) => {
    req.userId = 'test-user-id';
    next();
  }),
}));

vi.mock('@arandil/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@arandil/core')>();
  return {
    ...actual,
    newCard: vi.fn(() => ({
      user_id: 'test-user-id',
      question_id: 'test-question-id',
      due: new Date(),
      stability: 0.3,
      difficulty: 0.3,
      elapsed_days: 0,
      scheduled_days: 0,
      learning_steps: 0,
      reps: 0,
      lapses: 0,
      state: 0,
      last_review: null,
    })),
    scheduleCard: vi.fn((card) => ({
      ...card,
      reps: card.reps + 1,
      due: new Date(Date.now() + 24 * 60 * 60 * 1000),
      last_review: new Date(),
    })),
    ratingToGrade: vi.fn(() => 3), // Good rating
  };
});

const app = express();
app.use(express.json());
app.use('/practice', practiceRouter);

describe('Practice API', () => {
  let mockPool: any;

  beforeEach(async () => {
    const { getPool } = await import('../db/client.js');
    mockPool = (getPool as any)();
    vi.clearAllMocks();
  });

  describe('GET /practice/next', () => {
    it('returns existing due card', async () => {
      mockPool.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'card-123',
              user_id: 'test-user-id',
              question_id: 'q-456',
              due: new Date(),
              state: 1,
              reps: 2,
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'q-456',
              topic: 'algebra',
              subtopic: 'linear_equations',
              stem: '2x + 5 = 13',
              options: ['x = 2', 'x = 3', 'x = 4', 'x = 5', 'x = 6'],
              correct_index: 2,
            },
          ],
        });

      const res = await request(app).get('/practice/next');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('card');
      expect(res.body).toHaveProperty('question');
      expect(res.body.card.id).toBe('card-123');
      expect(res.body.question.topic).toBe('algebra');
    });

    it('creates new card when no due cards exist', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // No due cards
        .mockResolvedValueOnce({
          // New question
          rows: [
            {
              id: 'new-q-789',
              topic: 'geometry',
              stem: 'Pythagorean theorem question',
              approved: true,
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [{ id: 'new-card-id' }] }); // Insert result

      const res = await request(app).get('/practice/next');

      expect(res.status).toBe(200);
      expect(res.body.question.id).toBe('new-q-789');
      expect(mockPool.query).toHaveBeenCalledTimes(3);
    });

    it('returns message when no cards available', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // No due cards
        .mockResolvedValueOnce({ rows: [] }); // No new questions

      const res = await request(app).get('/practice/next');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('No more cards available');
      expect(res.body.card).toBeNull();
    });
  });

  describe('POST /practice/review', () => {
    it('updates card after review', async () => {
      mockPool.query
        .mockResolvedValueOnce({
          // Get card
          rows: [
            {
              id: 'card-123',
              user_id: 'test-user-id',
              question_id: 'q-456',
              difficulty: 0.3,
              stability: 0.3,
              elapsed_days: 0,
              scheduled_days: 0,
              learning_steps: 0,
              reps: 0,
              lapses: 0,
              state: 0,
              due: new Date(),
              last_review: null,
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] }); // Update query

      const res = await request(app).post('/practice/review').send({
        card_id: 'card-123',
        rating: 'good',
        correct: true,
        response_time_ms: 5000,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.card).toHaveProperty('due');
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });

    it('returns 400 for invalid rating', async () => {
      const res = await request(app).post('/practice/review').send({
        card_id: 'card-123',
        rating: 'invalid',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid rating');
    });

    it('returns 404 for non-existent card', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).post('/practice/review').send({
        card_id: 'nonexistent',
        rating: 'good',
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Card not found');
    });
  });

  describe('GET /practice/stats', () => {
    it('returns practice statistics', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '15' }] }) // Total cards
        .mockResolvedValueOnce({ rows: [{ count: '3' }] }) // Due cards
        .mockResolvedValueOnce({
          // State counts
          rows: [
            { state: 0, count: '5' },
            { state: 1, count: '3' },
            { state: 2, count: '7' },
          ],
        });

      const res = await request(app).get('/practice/stats');

      expect(res.status).toBe(200);
      expect(res.body.total_cards).toBe(15);
      expect(res.body.cards_due_today).toBe(3);
      expect(res.body.cards_new).toBe(5);
      expect(res.body.cards_learning).toBe(3);
      expect(res.body.cards_review).toBe(7);
    });
  });
});
