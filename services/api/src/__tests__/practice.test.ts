import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import practiceRouter from '../routes/practice.js';

// Create mock pool object
const mockQuery = vi.fn();
const mockPool = {
  query: mockQuery,
};

// Mock dependencies
vi.mock('../db/client.js', () => ({
  getPool: vi.fn(() => mockPool),
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /practice/next', () => {
    it('returns existing due card', async () => {
      const cardId = '550e8400-e29b-41d4-a716-446655440000';
      const questionId = '550e8400-e29b-41d4-a716-446655440001';

      mockQuery
        .mockResolvedValueOnce({
          rows: [
            {
              id: cardId,
              user_id: 'test-user-id',
              question_id: questionId,
              due: new Date(),
              state: 1,
              reps: 2,
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: questionId,
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
      expect(res.body.card.id).toBe(cardId);
      expect(res.body.question.topic).toBe('algebra');
    });

    it('creates new card when no due cards exist', async () => {
      const questionId = '550e8400-e29b-41d4-a716-446655440002';
      const newCardId = '550e8400-e29b-41d4-a716-446655440003';

      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // No due cards
        .mockResolvedValueOnce({
          // New question
          rows: [
            {
              id: questionId,
              topic: 'geometry',
              stem: 'Pythagorean theorem question',
              approved: true,
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [{ id: newCardId }] }); // Insert result

      const res = await request(app).get('/practice/next');

      expect(res.status).toBe(200);
      expect(res.body.question.id).toBe(questionId);
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('returns message when no cards available', async () => {
      mockQuery
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
      const cardId = '550e8400-e29b-41d4-a716-446655440004';
      const questionId = '550e8400-e29b-41d4-a716-446655440005';

      mockQuery
        .mockResolvedValueOnce({
          // Get card
          rows: [
            {
              id: cardId,
              user_id: 'test-user-id',
              question_id: questionId,
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
        card_id: cardId,
        rating: 'good',
        correct: true,
        response_time_ms: 5000,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.card).toHaveProperty('due');
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('returns 400 for missing fields', async () => {
      const cardId = '550e8400-e29b-41d4-a716-446655440006';

      const res = await request(app).post('/practice/review').send({
        card_id: cardId,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing required fields');
    });

    it('returns 400 for invalid rating', async () => {
      const cardId = '550e8400-e29b-41d4-a716-446655440007';

      const res = await request(app).post('/practice/review').send({
        card_id: cardId,
        rating: 'invalid',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid rating');
    });

    it('returns 400 for invalid card_id format', async () => {
      const res = await request(app).post('/practice/review').send({
        card_id: 'not-a-uuid',
        rating: 'good',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid card_id format');
    });

    it('returns 404 for non-existent card', async () => {
      const cardId = '550e8400-e29b-41d4-a716-446655440008';

      mockQuery.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).post('/practice/review').send({
        card_id: cardId,
        rating: 'good',
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Card not found');
    });
  });

  describe('GET /practice/stats', () => {
    it('returns practice statistics', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '15' }] }) // Total cards
        .mockResolvedValueOnce({ rows: [{ count: '3' }] }) // Due cards
        .mockResolvedValueOnce({
          // State counts
          rows: [
            { state: 0, count: '5' },
            { state: 1, count: '3' },
            { state: 2, count: '7' },
          ],
        })
        .mockResolvedValueOnce({ rows: [{ days: '5' }] }) // Streak
        .mockResolvedValueOnce({ rows: [{ accuracy: '78.5' }] }); // Accuracy

      const res = await request(app).get('/practice/stats');

      expect(res.status).toBe(200);
      expect(res.body.total_cards).toBe(15);
      expect(res.body.cards_due_today).toBe(3);
      expect(res.body.cards_new).toBe(5);
      expect(res.body.cards_learning).toBe(3);
      expect(res.body.cards_review).toBe(7);
      expect(res.body.streak_days).toBe(5);
      expect(res.body.accuracy_percent).toBe(78.5);
    });
  });
});
