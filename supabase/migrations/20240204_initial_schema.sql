-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Students Table
-- Links to auth.users via parent_id (assuming parent is the auth user)
-- In a real app, we might have a separate 'parents' table, but for this MVP, we assume auth.uid() is the parent.
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    grade TEXT, -- '1ro Primaria', etc.
    avatar_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their own students" 
ON public.students FOR SELECT 
TO authenticated 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert their own students" 
ON public.students FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their own students" 
ON public.students FOR UPDATE 
TO authenticated 
USING (auth.uid() = parent_id);


-- 2. Missions Table
-- Stores daily missions (homework or practice)
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    date_key TEXT NOT NULL, -- Format 'YYYY-MM-DD'
    type TEXT NOT NULL CHECK (type IN ('tarea', 'practica')),
    status TEXT NOT NULL DEFAULT 'creada', -- 'creada', 'en_progreso', 'completada'
    origin TEXT DEFAULT 'manual', -- 'manual', 'ai'
    title TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}'::JSONB, -- Context, difficulty, topics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for unique mission per student per day per type
CREATE UNIQUE INDEX IF NOT EXISTS idx_missions_student_date_type 
ON public.missions (student_id, date_key, type);

-- RLS for Missions (Access via student -> parent)
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Helper function to check student ownership
-- (Note: Performance-wise, a direct join in policy is often okay, but for strict RLS sometimes requires functions or simpler checks)
-- Simplified policy: Allow if the student belongs to the auth user.
CREATE POLICY "Parents can access missions of their students"
ON public.missions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = missions.student_id
        AND s.parent_id = auth.uid()
    )
);


-- 3. Mission Steps Table
-- The individual steps/exercises within a mission
CREATE TABLE IF NOT EXISTS public.mission_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE NOT NULL,
    step_index INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'exercise', 'explanation', 'video'
    content JSONB NOT NULL, -- The exercise data: question, options, answer
    status TEXT DEFAULT 'pendiente', -- 'pendiente', 'completado', 'bloqueado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mission_steps_mission_id 
ON public.mission_steps (mission_id);

-- RLS for Mission Steps
ALTER TABLE public.mission_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can access steps of their students missions"
ON public.mission_steps
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.missions m
        JOIN public.students s ON m.student_id = s.id
        WHERE m.id = mission_steps.mission_id
        AND s.parent_id = auth.uid()
    )
);


-- 4. Attempts Table
-- Tracks student answers and attempts
CREATE TABLE IF NOT EXISTS public.attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_id UUID REFERENCES public.mission_steps(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    answer JSONB NOT NULL, -- User's answer
    is_correct BOOLEAN NOT NULL,
    error_tag TEXT, -- 'signos', 'calculo', 'concepto', etc.
    feedback TEXT, -- AI generated or predefined feedback
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attempts_step_id 
ON public.attempts (step_id);

-- RLS for Attempts
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can access attempts of their students"
ON public.attempts
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = attempts.student_id
        AND s.parent_id = auth.uid()
    )
);


-- 5. Student Memory (Mastery / Session State)
-- Tracks aggregated progress or specific session states if needed
CREATE TABLE IF NOT EXISTS public.student_memory (
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    topic TEXT NOT NULL,
    mastery_level INTEGER DEFAULT 0, -- 0 to 100
    last_practiced_at TIMESTAMP WITH TIME ZONE,
    mistakes_history JSONB DEFAULT '[]'::JSONB,
    PRIMARY KEY (student_id, topic)
);

-- RLS for Student Memory
ALTER TABLE public.student_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can access memory of their students"
ON public.student_memory
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = student_memory.student_id
        AND s.parent_id = auth.uid()
    )
);

-- Grant permissions to authenticated users (just in case default privileges are strict)
GRANT ALL ON public.students TO authenticated;
GRANT ALL ON public.missions TO authenticated;
GRANT ALL ON public.mission_steps TO authenticated;
GRANT ALL ON public.attempts TO authenticated;
GRANT ALL ON public.student_memory TO authenticated;
