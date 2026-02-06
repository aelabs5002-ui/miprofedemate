-- Enable RLS on all core tables to BLOCK public access (Deny All by default)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_usage ENABLE ROW LEVEL SECURITY;

-- Note: No policies are created, which means implicit DENY ALL for anon/authenticated roles.
-- The Service Role (used by our Backend) bypasses RLS automatically.
