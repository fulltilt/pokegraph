#!/usr/bin/env sh
set -eu

SCHEMA="shared/prisma/schema.prisma"

echo "[1/4] Checking migration status"
STATUS_OUTPUT="$(npx prisma migrate status --schema="$SCHEMA" 2>&1 || true)"
echo "$STATUS_OUTPUT"

if echo "$STATUS_OUTPUT" | grep -qi "Can't reach database server"; then
  echo "Prisma status check failed due to database connectivity."
  exit 1
fi

echo "[2/4] Reconciling pg_trgm migration (safe no-op if already applied)"
PGTRGM_RESOLVE_OUTPUT="$(npx prisma migrate resolve --applied 20260121000100_add_pg_trgm --schema="$SCHEMA" 2>&1 || true)"
if echo "$PGTRGM_RESOLVE_OUTPUT" | grep -qi "marked as applied"; then
  echo "$PGTRGM_RESOLVE_OUTPUT"
elif echo "$PGTRGM_RESOLVE_OUTPUT" | grep -qi "already recorded as applied"; then
  echo "pg_trgm migration already recorded as applied."
elif echo "$PGTRGM_RESOLVE_OUTPUT" | grep -qi "Error:"; then
  echo "$PGTRGM_RESOLVE_OUTPUT"
  exit 1
fi

echo "[3/4] Reconciling failed views migration state (safe no-op if not needed)"
VIEWS_RESOLVE_OUTPUT="$(npx prisma migrate resolve --rolled-back 20260121000101_add_views_and_triggers --schema="$SCHEMA" 2>&1 || true)"
if echo "$VIEWS_RESOLVE_OUTPUT" | grep -qi "marked as rolled back"; then
  echo "$VIEWS_RESOLVE_OUTPUT"
elif echo "$VIEWS_RESOLVE_OUTPUT" | grep -qi "cannot be rolled back because it was never applied"; then
  echo "Views migration rollback not required."
elif echo "$VIEWS_RESOLVE_OUTPUT" | grep -qi "Error:"; then
  echo "$VIEWS_RESOLVE_OUTPUT"
  exit 1
fi

echo "[4/4] Running migrations"
npx prisma migrate dev --schema="$SCHEMA"
