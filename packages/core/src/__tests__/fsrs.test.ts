import { describe, it, expect } from 'vitest';
import { newCard, scheduleCard, getDueCards, Rating, ratingToGrade } from '../fsrs/index.js';

describe('FSRS', () => {
  const userId = 'test-user-123';
  const questionId = 'test-question-456';

  it('creates a new card with initial state', () => {
    const card = newCard(userId, questionId);

    expect(card.user_id).toBe(userId);
    expect(card.question_id).toBe(questionId);
    expect(card.state).toBe(0); // New
    expect(card.reps).toBe(0);
    expect(card.lapses).toBe(0);
    expect(card.last_review).toBeNull();
  });

  it('schedules card after review', () => {
    const card = newCard(userId, questionId);
    const now = new Date('2026-07-04T12:00:00Z');
    const reviewed = scheduleCard(card, Rating.Good, now);

    expect(reviewed.reps).toBe(1);
    expect(reviewed.state).toBeGreaterThan(0); // No longer New
    expect(reviewed.last_review).toEqual(now);
    expect(reviewed.due.getTime()).toBeGreaterThan(now.getTime());
  });

  it('filters due cards correctly', () => {
    const now = new Date('2026-07-04T12:00:00Z');
    const past = new Date('2026-07-03T12:00:00Z');
    const future = new Date('2026-07-05T12:00:00Z');

    const card1 = { ...newCard(userId, 'q1'), due: past };
    const card2 = { ...newCard(userId, 'q2'), due: future };
    const card3 = { ...newCard(userId, 'q3'), due: now };

    const dueCards = getDueCards([card1, card2, card3], now);

    expect(dueCards).toHaveLength(2);
    expect(dueCards.map((c) => c.question_id)).toEqual(['q1', 'q3']);
  });

  it('converts review ratings to grades', () => {
    expect(ratingToGrade('again')).toBe(Rating.Again);
    expect(ratingToGrade('hard')).toBe(Rating.Hard);
    expect(ratingToGrade('good')).toBe(Rating.Good);
    expect(ratingToGrade('easy')).toBe(Rating.Easy);
  });

  it('handles multiple reviews correctly', () => {
    let card = newCard(userId, questionId);
    const now = new Date('2026-07-04T12:00:00Z');

    // First review: Good
    card = scheduleCard(card, Rating.Good, now);
    expect(card.reps).toBe(1);

    // Second review: Hard (simulate forgetting a bit)
    const later = new Date(card.due.getTime() + 1000);
    card = scheduleCard(card, Rating.Hard, later);
    expect(card.reps).toBe(2);

    // Third review: Easy
    const muchLater = new Date(card.due.getTime() + 1000);
    card = scheduleCard(card, Rating.Easy, muchLater);
    expect(card.reps).toBe(3);
  });
});
