#!/usr/bin/env bash
set -euo pipefail

MIGRATIONS_DIR="$(dirname "$0")/../../services/api/src/db/migrations"

if [[ -z "${DATABASE_URL:-}" ]]; then
  if [[ -f ".env" ]]; then
    export $(grep -v '^#' .env | xargs)
  else
    echo "ERROR: DATABASE_URL not set and .env not found" >&2
    exit 1
  fi
fi

echo "Running migrations from $MIGRATIONS_DIR against $DATABASE_URL"

for migration in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
  echo "  → $(basename $migration)"
  psql "$DATABASE_URL" -f "$migration"
done

echo "Migrations complete."
