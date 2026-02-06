-- 1. Students (Perfil del alumno)
CREATE TABLE IF NOT EXISTS public.students (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    display_name text,
    grade text, -- '1sec', '2prim', etc.
    created_at timestamptz DEFAULT now()
);

-- 2. Missions (La misión global del día)
CREATE TABLE IF NOT EXISTS public.missions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
    origin text DEFAULT 'ai', -- 'ai' | 'upload'
    status text DEFAULT 'pending', -- 'pending' | 'in_progress' | 'completed'
    title text,
    description text,
    created_at timestamptz DEFAULT now()
);

-- 3. Mission Steps (Cada problema o paso)
CREATE TABLE IF NOT EXISTS public.mission_steps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id uuid REFERENCES public.missions(id) ON DELETE CASCADE,
    step_index int,
    content jsonb, -- { question, answer, hint, etc }
    status text DEFAULT 'pending', -- 'pending' | 'completed'
    created_at timestamptz DEFAULT now()
);

-- 4. Attempts (Intentos del alumno por step)
CREATE TABLE IF NOT EXISTS public.attempts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    step_id uuid REFERENCES public.mission_steps(id) ON DELETE CASCADE,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE, -- redundante pero útil
    user_input text,
    is_correct boolean,
    feedback text, -- respuesta del tutor
    created_at timestamptz DEFAULT now()
);

-- 5. Help Events (Solicitudes de ayuda/pistas)
CREATE TABLE IF NOT EXISTS public.help_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id uuid REFERENCES public.missions(id) ON DELETE CASCADE,
    step_id uuid REFERENCES public.mission_steps(id) ON DELETE CASCADE,
    type text, -- 'hint_request' | 'explanation'
    created_at timestamptz DEFAULT now()
);

-- 6. Session State (Estado actual para recuperación)
CREATE TABLE IF NOT EXISTS public.session_state (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id uuid REFERENCES public.missions(id) ON DELETE CASCADE,
    state_json jsonb, -- Snapshot del frontend
    updated_at timestamptz DEFAULT now()
);

-- 7. Voice Usage (Telemetría de voz)
CREATE TABLE IF NOT EXISTS public.voice_usage (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id uuid REFERENCES public.missions(id) ON DELETE CASCADE,
    seconds_used int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_missions_student ON public.missions(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_step ON public.attempts(step_id);
