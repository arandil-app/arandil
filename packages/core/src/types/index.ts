export type AuthProvider = 'email' | 'google';
export type Plan = 'free' | 'premium';
export type Mood = 1 | 2 | 3; // 1=😴, 2=😐, 3=⚡

// Subject areas for mathematics learning
export type SubjectArea = 'algebra' | 'geometry' | 'calculus' | 'trigonometry' | 'statistics' | 'general';

export interface User {
  id: string;
  supabase_id: string;
  email: string;
  name: string | null;
  subject_focus: SubjectArea | null;
  learning_goal: string | null;
  plan: Plan;
  sessions_this_month: number;
  created_at: Date;
  updated_at: Date;
}

export type QuestionType = 'mcq' | 'open';

export interface Question {
  id: string;
  topic: string; // e.g., 'algebra', 'geometry', 'calculus'
  subtopic: string; // e.g., 'linear_equations', 'pythagorean_theorem'
  stem: string;
  options: [string, string, string, string, string];
  correct_index: 0 | 1 | 2 | 3 | 4;
  question_type: QuestionType;
  answer_text: string | null;
  solution_steps: string[] | null;
  difficulty: number | null;
  discrimination: number | null;
  approved: boolean;
  created_at: Date;
}

export interface FSRSCard {
  id?: string; // DB-assigned; absent before insertion
  user_id: string;
  question_id: string;
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: 0 | 1 | 2 | 3; // New, Learning, Review, Relearning
  last_review: Date | null;
}

export interface Session {
  id: string;
  user_id: string;
  mood: Mood | null;
  started_at: Date;
  completed_at: Date | null;
  cards_attempted: number;
  cards_correct: number;
}

export interface SessionResponse {
  id: string;
  session_id: string;
  question_id: string;
  selected_index: 0 | 1 | 2 | 3 | 4;
  correct: boolean;
  response_time_ms: number;
  created_at: Date;
}

// Review rating from user perspective
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

// Practice stats
export interface PracticeStats {
  total_cards: number;
  cards_due_today: number;
  cards_learning: number;
  cards_review: number;
  streak_days: number;
  accuracy_percent: number;
}
