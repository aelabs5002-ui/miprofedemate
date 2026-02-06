-- DB-1: Add error_tag to attempts for categorical error tracking
-- Rules: 
-- 1. No new tables.
-- 2. No constraints on text yet (application level validation).

ALTER TABLE public.attempts 
ADD COLUMN IF NOT EXISTS error_tag text;

-- Optional: Comments for documentation
COMMENT ON COLUMN public.attempts.error_tag IS 'Categorical error type: sign_error, procedure_error, concept_error, reading_error, none';
