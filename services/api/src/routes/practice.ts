import { Router } from 'express';
import { getPool } from '../db/client.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';
import { newCard, scheduleCard, ratingToGrade, type ReviewRating } from '@arandil/core';
import type { Question, FSRSCard } from '@arandil/core';

const router = Router();

// GET /practice/next — Get next card to practice
router.get('/next', authMiddleware, async (req: AuthRequest, res) => {
  const pool = getPool();
  const userId = req.userId!;

  try {
    // Get due cards for user
    const dueCardsResult = await pool.query<FSRSCard>(
      `SELECT * FROM cards
       WHERE user_id = $1 AND due <= NOW()
       ORDER BY due ASC
       LIMIT 1`,
      [userId]
    );

    if (dueCardsResult.rows.length > 0) {
      // Return existing due card
      const card = dueCardsResult.rows[0]!;
      const questionResult = await pool.query<Question>(
        'SELECT * FROM questions WHERE id = $1',
        [card.question_id]
      );

      if (questionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }

      return res.json({
        card: {
          id: card.id,
          question_id: card.question_id,
          due: card.due,
          state: card.state,
          reps: card.reps,
        },
        question: questionResult.rows[0],
      });
    }

    // No due cards — create new one from question pool
    const newQuestionResult = await pool.query<Question>(
      `SELECT q.* FROM questions q
       WHERE q.approved = true
       AND q.id NOT IN (
         SELECT question_id FROM cards WHERE user_id = $1
       )
       ORDER BY RANDOM()
       LIMIT 1`,
      [userId]
    );

    if (newQuestionResult.rows.length === 0) {
      return res.json({ card: null, question: null, message: 'No more cards available' });
    }

    const question = newQuestionResult.rows[0]!;
    const card = newCard(userId, question.id);

    // Insert new card
    const insertResult = await pool.query<{ id: string }>(
      `INSERT INTO cards (user_id, question_id, difficulty, stability, elapsed_days, scheduled_days, learning_steps, reps, lapses, state, due, last_review)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        card.user_id,
        card.question_id,
        card.difficulty,
        card.stability,
        card.elapsed_days,
        card.scheduled_days,
        card.learning_steps,
        card.reps,
        card.lapses,
        card.state,
        card.due,
        card.last_review,
      ]
    );

    const cardId = insertResult.rows[0]!.id;

    return res.json({
      card: {
        id: cardId,
        question_id: card.question_id,
        due: card.due,
        state: card.state,
        reps: card.reps,
      },
      question,
    });
  } catch (error) {
    console.error('[practice/next] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /practice/review — Submit review and update card
router.post('/review', authMiddleware, async (req: AuthRequest, res) => {
  const pool = getPool();
  const userId = req.userId!;
  const { card_id, rating, correct, response_time_ms } = req.body;

  // Validate required fields
  if (!card_id || !rating) {
    return res.status(400).json({ error: 'Missing required fields: card_id, rating' });
  }

  // Validate rating enum
  if (!['again', 'hard', 'good', 'easy'].includes(rating)) {
    return res.status(400).json({ error: 'Invalid rating. Must be: again, hard, good, easy' });
  }

  // Validate card_id format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(card_id)) {
    return res.status(400).json({ error: 'Invalid card_id format' });
  }

  // Validate correct (if provided)
  if (correct !== undefined && typeof correct !== 'boolean') {
    return res.status(400).json({ error: 'Field "correct" must be boolean' });
  }

  // Validate response_time_ms (if provided)
  if (response_time_ms !== undefined) {
    const responseTime = parseInt(response_time_ms, 10);
    if (isNaN(responseTime) || responseTime < 0 || responseTime > 600000) {
      return res.status(400).json({ error: 'Field "response_time_ms" must be 0-600000' });
    }
  }

  try {
    // Get current card
    const cardResult = await pool.query<FSRSCard>(
      'SELECT * FROM cards WHERE id = $1 AND user_id = $2',
      [card_id, userId]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const currentCard = cardResult.rows[0]!;

    // Schedule next review
    const grade = ratingToGrade(rating as ReviewRating);
    const updatedCard = scheduleCard(currentCard, grade);

    // Update card in database
    await pool.query(
      `UPDATE cards
       SET difficulty = $1, stability = $2, elapsed_days = $3, scheduled_days = $4,
           learning_steps = $5, reps = $6, lapses = $7, state = $8, due = $9, last_review = $10,
           updated_at = NOW()
       WHERE id = $11 AND user_id = $12`,
      [
        updatedCard.difficulty,
        updatedCard.stability,
        updatedCard.elapsed_days,
        updatedCard.scheduled_days,
        updatedCard.learning_steps,
        updatedCard.reps,
        updatedCard.lapses,
        updatedCard.state,
        updatedCard.due,
        updatedCard.last_review,
        card_id,
        userId, // Extra safety: verify user_id in UPDATE
      ]
    );

    return res.json({
      success: true,
      card: {
        id: card_id,
        due: updatedCard.due,
        state: updatedCard.state,
        reps: updatedCard.reps,
        next_review_in_days: Math.max(
          0,
          Math.ceil((updatedCard.due.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        ),
      },
    });
  } catch (error) {
    console.error('[practice/review] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /practice/stats — Get user practice statistics
router.get('/stats', authMiddleware, async (req: AuthRequest, res) => {
  const pool = getPool();
  const userId = req.userId!;

  try {
    // Total cards
    const totalCardsResult = await pool.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM cards WHERE user_id = $1',
      [userId]
    );

    // Cards due today
    const dueCardsResult = await pool.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM cards WHERE user_id = $1 AND due <= NOW()',
      [userId]
    );

    // Cards in each state
    const stateCountsResult = await pool.query<{ state: number; count: string }>(
      'SELECT state, COUNT(*) as count FROM cards WHERE user_id = $1 GROUP BY state',
      [userId]
    );

    const stateCounts = stateCountsResult.rows.reduce((acc, row) => {
      acc[row.state] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<number, number>);

    // Streak calculation: consecutive days with completed sessions
    const streakResult = await pool.query<{ days: number }>(
      `WITH daily_activity AS (
        SELECT DATE(started_at) as day
        FROM sessions
        WHERE user_id = $1 AND completed_at IS NOT NULL
        GROUP BY DATE(started_at)
        ORDER BY DATE(started_at) DESC
      ),
      streak AS (
        SELECT day,
               ROW_NUMBER() OVER (ORDER BY day DESC) as rn,
               day - INTERVAL '1 day' * ROW_NUMBER() OVER (ORDER BY day DESC) as streak_group
        FROM daily_activity
      )
      SELECT COUNT(*) as days
      FROM streak
      WHERE streak_group = (
        SELECT streak_group
        FROM streak
        WHERE day = CURRENT_DATE OR day = CURRENT_DATE - INTERVAL '1 day'
        LIMIT 1
      )`,
      [userId]
    );

    const streakDays = parseInt(String(streakResult.rows[0]?.days || 0), 10);

    // Accuracy calculation: % of correct responses
    const accuracyResult = await pool.query<{ accuracy: string }>(
      `SELECT COALESCE(
        ROUND(
          (SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
          1
        ),
        0
      ) as accuracy
      FROM session_responses sr
      JOIN sessions s ON sr.session_id = s.id
      WHERE s.user_id = $1`,
      [userId]
    );

    const accuracyPercent = parseFloat(accuracyResult.rows[0]?.accuracy || '0');

    return res.json({
      total_cards: parseInt(totalCardsResult.rows[0]?.count || '0', 10),
      cards_due_today: parseInt(dueCardsResult.rows[0]?.count || '0', 10),
      cards_new: stateCounts[0] || 0,
      cards_learning: stateCounts[1] || 0,
      cards_review: stateCounts[2] || 0,
      cards_relearning: stateCounts[3] || 0,
      streak_days: streakDays,
      accuracy_percent: accuracyPercent,
    });
  } catch (error) {
    console.error('[practice/stats] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
