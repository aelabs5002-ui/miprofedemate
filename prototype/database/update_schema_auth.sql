-- 1. Create Parents Table linked to auth.users
-- We reference auth.users.id. 
-- Note: auth schema must exist. In standard Supabase it does.
CREATE TABLE IF NOT EXISTS public.parents (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    created_at timestamptz DEFAULT now()
);

-- 2. Add parent_id to Students
-- We allow NULLs for now to support existing students without parents (orphans)
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.parents(id);

-- 3. Enable RLS on Parents
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;

-- 4. Index on parent_id for performance
CREATE INDEX IF NOT EXISTS idx_students_parent ON public.students(parent_id);
