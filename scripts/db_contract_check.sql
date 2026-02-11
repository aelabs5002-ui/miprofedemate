-- FAIL FAST if key columns are missing in public.students
DO $$
DECLARE
  missing_cols text;
BEGIN
  SELECT string_agg(col, ', ') INTO missing_cols
  FROM (
    SELECT unnest(ARRAY['display_name','parent_id','avatar_id']) AS col
    EXCEPT
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='students'
  ) t;

  IF missing_cols IS NOT NULL THEN
    RAISE EXCEPTION 'DB CONTRACT FAIL: missing columns in public.students: %', missing_cols;
  END IF;
END $$;

-- Verify EXACT FK: students_parent_id_fkey = students.parent_id -> public.parents.id
DO $$
DECLARE
  fk_ok boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON kcu.constraint_name = tc.constraint_name
     AND kcu.table_schema = tc.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
     AND ccu.table_schema = tc.table_schema
    WHERE tc.table_schema='public'
      AND tc.table_name='students'
      AND tc.constraint_type='FOREIGN KEY'
      AND tc.constraint_name='students_parent_id_fkey'
      AND kcu.column_name='parent_id'
      AND ccu.table_schema='public'
      AND ccu.table_name='parents'
      AND ccu.column_name='id'
  ) INTO fk_ok;

  IF NOT fk_ok THEN
    RAISE EXCEPTION 'DB CONTRACT FAIL: FK students_parent_id_fkey must be students.parent_id -> public.parents.id';
  END IF;
END $$;

-- Verify minimum policies (students: SELECT+INSERT, parents: SELECT+INSERT)
DO $$
DECLARE
  missing_policies text;
BEGIN
  SELECT string_agg(p, '; ') INTO missing_policies
  FROM (
    SELECT 'students:insert' AS p
    WHERE NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname='public' AND tablename='students' AND cmd='INSERT'
    )
    UNION ALL
    SELECT 'students:select'
    WHERE NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname='public' AND tablename='students' AND cmd='SELECT'
    )
    UNION ALL
    SELECT 'parents:insert'
    WHERE NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname='public' AND tablename='parents' AND cmd='INSERT'
    )
    UNION ALL
    SELECT 'parents:select'
    WHERE NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname='public' AND tablename='parents' AND cmd='SELECT'
    )
  ) t;

  IF missing_policies IS NOT NULL THEN
    RAISE EXCEPTION 'DB CONTRACT FAIL: missing RLS policies => %', missing_policies;
  END IF;
END $$;

SELECT 'DB CONTRACT OK' AS status;
