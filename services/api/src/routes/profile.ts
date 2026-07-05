import { Router } from 'express';
import { getPool } from '../db/client.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

interface User {
  id: string;
  supabase_id: string;
  email: string;
  name: string | null;
  subject_focus: string | null;
  learning_goal: string | null;
  study_minutes_day: number | null;
  math_level: string | null;
  preferred_topic: string | null;
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

// GET /user/profile — Get current user profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
  const pool = getPool();
  const userId = req.userId!;

  try {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0]!;

    // Don't send sensitive fields
    const { supabase_id, deleted_at, ...safeUser } = user as any;

    return res.json(safeUser);
  } catch (error) {
    console.error('[profile/get] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /user/profile — Update user profile
router.patch('/profile', authMiddleware, async (req: AuthRequest, res) => {
  const pool = getPool();
  const userId = req.userId!;
  const {
    name,
    subject_focus,
    learning_goal,
    study_minutes_day,
    math_level,
    preferred_topic,
    onboarding_completed,
  } = req.body;

  // Validate math_level enum
  if (math_level !== undefined && !['beginner', 'intermediate', 'advanced'].includes(math_level)) {
    return res.status(400).json({
      error: 'Invalid math_level. Must be: beginner, intermediate, advanced',
    });
  }

  // Validate study_minutes_day range
  if (study_minutes_day !== undefined) {
    const minutes = parseInt(study_minutes_day, 10);
    if (isNaN(minutes) || minutes < 5 || minutes > 180) {
      return res.status(400).json({
        error: 'Invalid study_minutes_day. Must be 5-180',
      });
    }
  }

  // Validate onboarding_completed boolean
  if (onboarding_completed !== undefined && typeof onboarding_completed !== 'boolean') {
    return res.status(400).json({
      error: 'Invalid onboarding_completed. Must be boolean',
    });
  }

  // Build dynamic UPDATE query
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (subject_focus !== undefined) {
    updates.push(`subject_focus = $${paramIndex++}`);
    values.push(subject_focus);
  }
  if (learning_goal !== undefined) {
    updates.push(`learning_goal = $${paramIndex++}`);
    values.push(learning_goal);
  }
  if (study_minutes_day !== undefined) {
    updates.push(`study_minutes_day = $${paramIndex++}`);
    values.push(study_minutes_day);
  }
  if (math_level !== undefined) {
    updates.push(`math_level = $${paramIndex++}`);
    values.push(math_level);
  }
  if (preferred_topic !== undefined) {
    updates.push(`preferred_topic = $${paramIndex++}`);
    values.push(preferred_topic);
  }
  if (onboarding_completed !== undefined) {
    updates.push(`onboarding_completed = $${paramIndex++}`);
    values.push(onboarding_completed);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  // Always update updated_at
  updates.push(`updated_at = NOW()`);
  values.push(userId);

  try {
    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query<User>(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0]!;
    const { supabase_id, deleted_at, ...safeUser } = user as any;

    return res.json(safeUser);
  } catch (error) {
    console.error('[profile/patch] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
