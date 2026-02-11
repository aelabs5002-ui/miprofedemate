-- ==============================================================================
-- DB CONTRACT CHECK
-- Purpose: Verify that the DB schema matches the application's expectations.
-- Usage: Run this against the Supabase DB. If it fails, the deployment should abort.
-- ==============================================================================

BEGIN;

DO $$
DECLARE
    missing_cols text;
    fk_exists boolean;
    policy_exists boolean;
BEGIN
    -- 1. CHECK REQUIRED COLUMNS in public.students
    --    (display_name, parent_id, avatar_id)
    SELECT string_agg(column_name, ', ')
    INTO missing_cols
    FROM (
        SELECT 'display_name' AS col UNION ALL
        SELECT 'parent_id' UNION ALL
        SELECT 'avatar_id'
    ) required_cols
    WHERE col NOT IN (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'students'
    );

    IF missing_cols IS NOT NULL THEN
        RAISE EXCEPTION 'DB CONTRACT VIOLATION: Missing required columns in public.students: %', missing_cols;
    END IF;

    -- 2. CHECK FOREIGN KEY (students -> parents)
    --    We look for a constraint that references public.parents(id)
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.referential_constraints rc
        JOIN information_schema.key_column_usage kcu
          ON kcu.constraint_name = rc.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = rc.unique_constraint_name
        WHERE kcu.table_name = 'students'
          AND ccu.table_name = 'parents'
          AND ccu.column_name = 'id'
    ) INTO fk_exists;

    IF NOT fk_exists THEN
        RAISE EXCEPTION 'DB CONTRACT VIOLATION: public.students MUST have a Foreign Key to public.parents(id).';
    END IF;

    -- 3. CHECK POLICIES EXIST (Basic sanity check)
    --    We just want to ensure RLS is active and some policies exist.
    SELECT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'students'
    ) AND EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'parents'
    ) INTO policy_exists;

    IF NOT policy_exists THEN
        RAISE EXCEPTION 'DB CONTRACT VIOLATION: RLS Policies missing for students or parents tables.';
    END IF;

    RAISE NOTICE 'DB CONTRACT CHECK PASSED: Schema rules satisfied.';
END $$;

COMMIT;
