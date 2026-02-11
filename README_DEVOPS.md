# DevOps Documentation

## CI/CD Pipeline

This repository uses GitHub Actions for Continuous Integration. The pipeline is defined in `.github/workflows/ci.yml`.

### Triggers
- Pushes to `main` branch
- Pull Requests targeting `main` branch

### Steps
1.  **Checkout**: Clones the repository.
2.  **Setup Node.js**: Installs Node 20.
3.  **Install Dependencies**: Runs `npm ci`.
4.  **Build**: Runs `npm run build`.
5.  **Typecheck**: Runs `npx tsc --noEmit`.
6.  **Lint**: Runs `npm run lint`.
7.  **DB Contract Check**: Verifies the database schema against contract requirements.

## Secrets Configuration

To enable the **DB Contract Check**, you must configure the following secret in your GitHub Repository settings (Settings -> Secrets and variables -> Actions):

-   **Name**: `SUPABASE_DB_URL`
-   **Value**: Connection string to your Supabase PostgreSQL database.
    -   Format: `postgres://[user]:[password]@[host]:[port]/[db_name]`
    -   **Recommendation**: Use a specific read-only database user for this secret to adhere to the principle of least privilege, as this script only runs `SELECT` queries to inspect schemas.

## Scripts

### `scripts/db_contract_check.sql`
A SQL script that validates the database schema. It checks for:
-   Required columns in `public.students` (`display_name`, `parent_id`, `avatar_id`).
-   Existence of Foreign Key constraint from `students.parent_id` to `parents.id`.
-   Existence of RLS policies on `students` and `parents` tables.

### `scripts/run_db_contract_check.sh`
A shell script wrapper that executes the SQL check using `psql`. It requires the `SUPABASE_DB_URL` environment variable.
