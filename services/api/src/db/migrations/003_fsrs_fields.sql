-- 003_fsrs_fields.sql — Agregar campos FSRS completos
-- Actualiza tabla cards para soportar ts-fsrs completamente

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS elapsed_days INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scheduled_days INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS learning_steps INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reps INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lapses INT NOT NULL DEFAULT 0;

-- Actualizar tipo de state para usar números (0-3) como ts-fsrs espera
-- 0=New, 1=Learning, 2=Review, 3=Relearning
ALTER TABLE cards
  DROP COLUMN IF EXISTS state CASCADE;

ALTER TABLE cards
  ADD COLUMN state SMALLINT NOT NULL DEFAULT 0;

-- Índices adicionales para optimizar queries de práctica
CREATE INDEX IF NOT EXISTS idx_cards_user_due ON cards(user_id, due);
CREATE INDEX IF NOT EXISTS idx_cards_state ON cards(state);
