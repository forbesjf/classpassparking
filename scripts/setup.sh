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

if [ ! -f prisma/dev.db ]; then
  echo "→ Creating and seeding database…"
  npx prisma db push --skip-generate >/dev/null
  npm run db:seed
else
  # Make sure the schema is applied even if the db already exists.
  npx prisma db push --skip-generate >/dev/null
fi

echo "✓ SpotPass is ready. Run 'npm run dev' to start."
