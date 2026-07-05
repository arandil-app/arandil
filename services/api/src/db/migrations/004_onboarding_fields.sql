-- 004_onboarding_fields.sql — Campos para onboarding matemático

-- Agregar campos de onboarding a users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS math_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
  ADD COLUMN IF NOT EXISTS preferred_topic VARCHAR(100), -- 'algebra', 'geometry', etc.
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Índice para onboarding_completed (query frecuente en auth)
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);

-- Comentarios para documentación
COMMENT ON COLUMN users.math_level IS 'Nivel matemático autoreportado: beginner, intermediate, advanced';
COMMENT ON COLUMN users.preferred_topic IS 'Tema inicial preferido por usuario en onboarding';
COMMENT ON COLUMN users.onboarding_completed IS 'Si usuario completó flujo de onboarding (true) o no (false)';
