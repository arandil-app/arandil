-- 001_init.sql — Schema inicial Arandil
-- Tablas base sin conceptos de admisión/universidades

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_id UUID NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),

  -- Learning profile (global, no exam-specific)
  subject_focus VARCHAR(100), -- 'mathematics', 'physics', etc. (future expansion)
  learning_goal TEXT,
  study_minutes_day SMALLINT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_supabase_id ON users(supabase_id);
CREATE INDEX idx_users_email ON users(email);

-- Study cards (FSRS)
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- FSRS parameters
  difficulty REAL NOT NULL DEFAULT 0.3,
  stability REAL NOT NULL DEFAULT 0.3,
  retrievability REAL,

  -- Content reference
  question_id UUID, -- references questions table (created later)
  topic VARCHAR(255),

  -- Scheduling
  due TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  state VARCHAR(20) NOT NULL DEFAULT 'new', -- 'new', 'learning', 'review', 'relearning'
  last_review TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_due ON cards(due);
CREATE INDEX idx_cards_topic ON cards(topic);

-- Study sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session data
  topic VARCHAR(255),
  cards_reviewed INT DEFAULT 0,
  cards_correct INT DEFAULT 0,
  duration_seconds INT,

  -- Metadata
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at);

-- Questions (AI-generated or manual)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  topic VARCHAR(255) NOT NULL, -- 'algebra', 'geometry', 'calculus', etc.
  subtopic VARCHAR(255),
  stem TEXT NOT NULL,
  options JSONB NOT NULL, -- array of strings
  correct_index INT NOT NULL,
  solution_steps JSONB, -- array of strings (optional)

  -- Difficulty (IRT)
  difficulty REAL,

  -- Source & approval
  source VARCHAR(20) NOT NULL, -- 'ai', 'manual'
  approved BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_approved ON questions(approved);
CREATE INDEX idx_questions_source ON questions(source);

-- Session responses
CREATE TABLE IF NOT EXISTS session_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  question_id UUID REFERENCES questions(id) ON DELETE SET NULL,

  -- Response data
  is_correct BOOLEAN NOT NULL,
  time_seconds INT,
  selected_index INT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_session_responses_session_id ON session_responses(session_id);
CREATE INDEX idx_session_responses_card_id ON session_responses(card_id);

-- Usage counters (for tier limits)
CREATE TABLE IF NOT EXISTS usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Counters
  sessions_this_month INT DEFAULT 0,
  ai_questions_this_month INT DEFAULT 0,

  -- Period tracking
  current_month DATE NOT NULL DEFAULT CURRENT_DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, current_month)
);

CREATE INDEX idx_usage_counters_user_id ON usage_counters(user_id);
