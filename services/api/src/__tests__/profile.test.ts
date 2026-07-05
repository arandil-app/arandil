import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import profileRouter from '../routes/profile.js';

const mockQuery = vi.fn();
const mockPool = {
  query: mockQuery,
};

vi.mock('../db/client.js', () => ({
  getPool: vi.fn(() => mockPool),
}));

vi.mock('../middleware/auth.js', () => ({
  authMiddleware: vi.fn((req, _res, next) => {
    req.userId = 'test-user-id';
    next();
  }),
}));

const app = express();
app.use(express.json());
app.use('/user', profileRouter);

describe('Profile API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /user/profile', () => {
    it('returns user profile without sensitive fields', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 'test-user-id',
            supabase_id: 'supabase-uuid',
            email: 'user@example.com',
            name: 'Test User',
            subject_focus: 'mathematics',
            learning_goal: 'Pasar cálculo 1',
            study_minutes_day: 30,
            math_level: 'intermediate',
            preferred_topic: 'algebra',
            onboarding_completed: true,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
          },
        ],
      });

      const res = await request(app).get('/user/profile');

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('user@example.com');
      expect(res.body.onboarding_completed).toBe(true);
      expect(res.body).not.toHaveProperty('supabase_id');
      expect(res.body).not.toHaveProperty('deleted_at');
    });

    it('returns 404 if user not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/user/profile');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });
  });

  describe('PATCH /user/profile', () => {
    it('updates profile with valid onboarding data', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 'test-user-id',
            supabase_id: 'supabase-uuid',
            email: 'user@example.com',
            name: 'Test User',
            math_level: 'beginner',
            learning_goal: 'Aprender álgebra',
            study_minutes_day: 20,
            preferred_topic: 'algebra',
            onboarding_completed: true,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
          },
        ],
      });

      const res = await request(app).patch('/user/profile').send({
        math_level: 'beginner',
        learning_goal: 'Aprender álgebra',
        study_minutes_day: 20,
        preferred_topic: 'algebra',
        onboarding_completed: true,
      });

      expect(res.status).toBe(200);
      expect(res.body.math_level).toBe('beginner');
      expect(res.body.onboarding_completed).toBe(true);
    });

    it('returns 400 for invalid math_level', async () => {
      const res = await request(app).patch('/user/profile').send({
        math_level: 'expert',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid math_level');
    });

    it('returns 400 for study_minutes_day out of range (too low)', async () => {
      const res = await request(app).patch('/user/profile').send({
        study_minutes_day: 2,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('study_minutes_day');
    });

    it('returns 400 for study_minutes_day out of range (too high)', async () => {
      const res = await request(app).patch('/user/profile').send({
        study_minutes_day: 300,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('study_minutes_day');
    });

    it('returns 400 for non-boolean onboarding_completed', async () => {
      const res = await request(app).patch('/user/profile').send({
        onboarding_completed: 'yes',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('onboarding_completed');
    });

    it('returns 400 when no fields provided', async () => {
      const res = await request(app).patch('/user/profile').send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('No fields to update');
    });

    it('returns 404 if user not found on update', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).patch('/user/profile').send({
        math_level: 'advanced',
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('scopes update to authenticated user id', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 'test-user-id',
            email: 'user@example.com',
            math_level: 'advanced',
            onboarding_completed: false,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      await request(app).patch('/user/profile').send({ math_level: 'advanced' });

      const [query, values] = mockQuery.mock.calls[0]!;
      expect(query).toContain('WHERE id = $');
      expect(values[values.length - 1]).toBe('test-user-id');
    });
  });
});
