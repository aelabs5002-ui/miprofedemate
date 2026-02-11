#!/usr/bin/env bash
set -euo pipefail

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "Error: SUPABASE_DB_URL not set"
  exit 1
fi

psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f scripts/db_contract_check.sql
