import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: { headers: { Authorization: req.headers.get('Authorization')! } },
            }
        )

        const { studentId, dateKey, type = 'practica' } = await req.json()

        if (!studentId || !dateKey) {
            throw new Error('Missing studentId or dateKey')
        }

        // 1. Check if mission exists
        const { data: existingMissions, error: findError } = await supabaseClient
            .from('missions')
            .select('*, mission_steps(*)')
            .eq('student_id', studentId)
            .eq('date_key', dateKey)
            .eq('type', type)
            .limit(1)

        if (findError) throw findError

        if (existingMissions && existingMissions.length > 0) {
            console.log('Returning existing mission')
            return new Response(JSON.stringify(existingMissions[0]), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 2. Create new mission if not exists
        const newMission = {
            student_id: studentId,
            date_key: dateKey,
            type: type,
            status: 'creada',
            origin: type === 'practica' ? 'ai' : 'manual',
            title: type === 'practica' ? 'Desafío Diario IA' : 'Tarea del Día',
            description: type === 'practica' ? 'Práctica personalizada generada por tu Coach IA' : 'Tarea asignada manualmente',
        }

        const { data: createdMission, error: createError } = await supabaseClient
            .from('missions')
            .insert(newMission)
            .select()
            .single()

        if (createError) throw createError

        // 3. Create initial steps (Placeholder steps)
        // In a real AI scenario, we might generate these based on student_memory
        const initialSteps = [
            {
                mission_id: createdMission.id,
                step_index: 0,
                type: 'exercise',
                content: {
                    question: "Calcula: 5 + 3",
                    options: ["6", "7", "8", "9"],
                    correctAnswer: "8",
                    difficulty: "easy"
                },
                status: 'pendiente'
            },
            {
                mission_id: createdMission.id,
                step_index: 1,
                type: 'exercise',
                content: {
                    question: "Calcula: 12 - 4",
                    options: ["6", "8", "10", "12"],
                    correctAnswer: "8",
                    difficulty: "easy"
                },
                status: 'pendiente'
            },
            {
                mission_id: createdMission.id,
                step_index: 2,
                type: 'exercise',
                content: {
                    question: "Calcula: 3 * 3",
                    options: ["6", "9", "12", "15"],
                    correctAnswer: "9",
                    difficulty: "medium"
                },
                status: 'pendiente'
            }
        ]

        const { data: createdSteps, error: stepsError } = await supabaseClient
            .from('mission_steps')
            .insert(initialSteps)
            .select()

        if (stepsError) throw stepsError

        const completeMission = {
            ...createdMission,
            mission_steps: createdSteps
        }

        return new Response(JSON.stringify(completeMission), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
