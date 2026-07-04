import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs';
import type { FSRSCard, ReviewRating } from '../types/index.js';

export { Rating };
export type { Grade };

const scheduler = fsrs(generatorParameters({ enable_fuzz: true }));

function toCard(c: FSRSCard): Card {
  // pg returns NUMERIC columns as strings — coerce to number so ts-fsrs
  // strict-equality checks (=== 0) detect new-card state correctly.
  const base = {
    due: c.due,
    stability: Number(c.stability),
    difficulty: Number(c.difficulty),
    elapsed_days: Number(c.elapsed_days),
    scheduled_days: Number(c.scheduled_days),
    learning_steps: Number(c.learning_steps),
    reps: Number(c.reps),
    lapses: Number(c.lapses),
    state: c.state as Card['state'],
  };
  return c.last_review ? { ...base, last_review: c.last_review } : base;
}

function fromCard(card: Card, base: FSRSCard): FSRSCard {
  return {
    ...base,
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as FSRSCard['state'],
    last_review: card.last_review ?? null,
  };
}

export function scheduleCard(card: FSRSCard, rating: Grade, now = new Date()): FSRSCard {
  const result = scheduler.next(toCard(card), now, rating);
  return fromCard(result.card, card);
}

export function getDueCards(cards: FSRSCard[], now = new Date()): FSRSCard[] {
  return cards.filter((c) => c.due <= now);
}

export function newCard(user_id: string, question_id: string): FSRSCard {
  const empty = createEmptyCard();
  return {
    user_id,
    question_id,
    due: empty.due,
    stability: empty.stability,
    difficulty: empty.difficulty,
    elapsed_days: empty.elapsed_days,
    scheduled_days: empty.scheduled_days,
    learning_steps: empty.learning_steps,
    reps: empty.reps,
    lapses: empty.lapses,
    state: empty.state as FSRSCard['state'],
    last_review: null,
  };
}

// Convert user-friendly rating to FSRS grade
export function ratingToGrade(rating: ReviewRating): Grade {
  switch (rating) {
    case 'again':
      return Rating.Again;
    case 'hard':
      return Rating.Hard;
    case 'good':
      return Rating.Good;
    case 'easy':
      return Rating.Easy;
  }
}
