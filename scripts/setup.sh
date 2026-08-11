#!/usr/bin/env bash
# Idempotent project setup: dependencies, Prisma client, and a seeded database.
# Safe to run repeatedly — used by the SessionStart hook and for local setup.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "→ Creating .env from .env.example…"
  cp .env.example .env
fi

if [ ! -d node_modules ]; then
  echo "→ Installing dependencies…"
  npm install
fi

echo "→ Generating Prisma client…"
npx prisma generate >/dev/null

# Sync the schema to Postgres if one is reachable. This is best-effort so the
# script (and the SessionStart hook) still succeed when no database is running
# — e.g. a fresh web session before `docker compose up -d`.
echo "→ Syncing database schema…"
if npx prisma db push --skip-generate >/dev/null 2>&1; then
  # The seed is idempotent (upserts), so it is safe to run every time.
  npm run db:seed || echo "  (seed skipped)"
  echo "✓ SpotPass is ready. Run 'npm run dev' to start."
else
  echo "⚠ No Postgres reachable at DATABASE_URL yet."
  echo "  Start one with 'docker compose up -d', then run:"
  echo "  npm run db:push && npm run db:seed"
fi
