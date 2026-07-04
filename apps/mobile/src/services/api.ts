import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export interface Question {
  id: string;
  topic: string;
  subtopic: string;
  stem: string;
  options: string[];
  correct_index: number;
  solution_steps?: string[];
}

export interface Card {
  id: string;
  question_id: string;
  due: string;
  state: number;
  reps: number;
}

export interface NextCardResponse {
  card: Card | null;
  question: Question | null;
  message?: string;
}

export interface ReviewResponse {
  success: boolean;
  card: {
    id: string;
    due: string;
    state: number;
    reps: number;
    next_review_in_days: number;
  };
}

export interface PracticeStats {
  total_cards: number;
  cards_due_today: number;
  cards_new: number;
  cards_learning: number;
  cards_review: number;
  cards_relearning: number;
  streak_days: number;
  accuracy_percent: number;
}

export async function getNextCard(): Promise<NextCardResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/practice/next`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch next card: ${response.statusText}`);
  }

  return response.json();
}

export async function submitReview(
  cardId: string,
  rating: 'again' | 'hard' | 'good' | 'easy',
  correct: boolean,
  responseTimeMs: number
): Promise<ReviewResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/practice/review`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      card_id: cardId,
      rating,
      correct,
      response_time_ms: responseTimeMs,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit review: ${response.statusText}`);
  }

  return response.json();
}

export async function getPracticeStats(): Promise<PracticeStats> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/practice/stats`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  return response.json();
}
