#!/bin/bash
set -e

# Usage: SUPABASE_DB_URL="postgres://user:pass@host:5432/db" ./scripts/run_db_contract_check.sh

if [ -z "$SUPABASE_DB_URL" ]; then
  echo "Error: SUPABASE_DB_URL environment variable is not set."
  exit 1
fi

echo "Running DB Contract Check..."

# Use psql to execute the check.
# -v ON_ERROR_STOP=1 ensures the script exits with stats 1 if the SQL raises an EXCEPTION.
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f scripts/db_contract_check.sql

echo "DB Contract Check completed successfully."
