#!/bin/sh
# Container entry point (see Dockerfile): every start gives a freshly seeded
# database, then serves the production build.
set -e

# Make local binaries (prisma, tsx, next) available by name, like inside
# `npm run …`. `prisma db seed` runs the command `tsx prisma/seed.ts`.
PATH="$(pwd)/node_modules/.bin:$PATH"
export PATH

echo "ShopLab: applying migrations to ${DATABASE_URL}"
prisma migrate deploy

echo "ShopLab: loading seed data"
prisma db seed

echo "ShopLab: starting on port ${PORT:-3000}" \
  "(chaos delay ${CHAOS_DELAY_MS:-0} ms, flaky ${CHAOS_FLAKY_PERCENT:-0}%," \
  "test hooks ${TEST_HOOKS_ENABLED:-false})"
exec next start -H 0.0.0.0 -p "${PORT:-3000}"
