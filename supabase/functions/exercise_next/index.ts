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

        const { missionId, studentId } = await req.json()

        if (!missionId) {
            throw new Error('Missing missionId')
        }

        // Get next pending step
        const { data: step, error: findError } = await supabaseClient
            .from('mission_steps')
            .select('*')
            .eq('mission_id', missionId)
            .eq('status', 'pendiente')
            .order('step_index', { ascending: true })
            .limit(1)
            .maybeSingle()

        if (findError) throw findError

        if (!step) {
            // No pending steps. Check if we should generate more (MOCK for now: just say complete)
            return new Response(JSON.stringify({ message: 'No more exercises', complete: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        return new Response(JSON.stringify(step), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
