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

        const { missionId, stepId, studentId, answer } = await req.json()

        if (!missionId || !stepId || !studentId || answer === undefined) {
            throw new Error('Missing required fields')
        }

        // 1. Fetch the step to get correctness criteria
        const { data: step, error: stepError } = await supabaseClient
            .from('mission_steps')
            .select('content, status')
            .eq('id', stepId)
            .single()

        if (stepError) throw stepError

        // 2. Evaluate answer
        // For MVP, simple string/value comparison. In real app, might need more complex logic.
        const correctAnswer = step.content.correctAnswer;
        const isCorrect = String(answer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();

        // 3. Record attempt
        const { error: attemptError } = await supabaseClient
            .from('attempts')
            .insert({
                step_id: stepId,
                student_id: studentId,
                answer: { value: answer },
                is_correct: isCorrect,
                error_tag: isCorrect ? null : 'general_error', // Basic tagging
                feedback: isCorrect ? '¡Correcto!' : 'Inténtalo de nuevo'
            })

        if (attemptError) throw attemptError

        // 4. If correct, update step status
        if (isCorrect) {
            const { error: updateStepError } = await supabaseClient
                .from('mission_steps')
                .update({ status: 'completado' })
                .eq('id', stepId)

            if (updateStepError) throw updateStepError

            // Check if mission is complete
            const { count } = await supabaseClient
                .from('mission_steps')
                .select('id', { count: 'exact', head: true })
                .eq('mission_id', missionId)
                .eq('status', 'pendiente')

            const missionComplete = count === 0;

            if (missionComplete) {
                await supabaseClient
                    .from('missions')
                    .update({ status: 'completada' })
                    .eq('id', missionId)
            }

            return new Response(JSON.stringify({ isCorrect: true, feedback: '¡Bien hecho!', missionComplete }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        } else {
            return new Response(JSON.stringify({ isCorrect: false, feedback: 'Respuesta incorrecta, intenta otra vez.', missionComplete: false }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
