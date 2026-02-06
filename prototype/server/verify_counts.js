import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
});

const TABLES = [
    'students',
    'missions',
    'mission_steps',
    'attempts',
    'help_events',
    'session_state',
    'voice_usage'
];

async function verify() {
    console.log('--- DB VERIFICATION (REST API) ---');
    console.log(`URL: ${SUPABASE_URL}`);

    let totalRows = 0;

    for (const table of TABLES) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`❌ ${table}: Error - ${error.message}`);
        } else {
            console.log(`✅ ${table}: ${count} rows`);
            totalRows += count || 0;
        }
    }

    // Get example IDs
    const { data: student } = await supabase.from('students').select('id, display_name').limit(1).single();
    if (student) console.log(`\nExample Student: ${student.display_name} (${student.id})`);

    const { data: mission } = await supabase.from('missions').select('id, title').limit(1).single();
    if (mission) console.log(`Example Mission: ${mission.title} (${mission.id})`);

}

verify();
