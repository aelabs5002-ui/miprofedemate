
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' }); // Load Frontend Keys
import dotenvServer from 'dotenv';
dotenvServer.config({ path: '.env' });    // Load Backend Keys

// Config
const URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SERVICE_KEY || !ANON_KEY) {
    console.error('❌ Keys missing in env vars');
    process.exit(1);
}

console.log(`🔍 Verifying Security on ${URL}`);

async function runTests() {
    // 1. Positive Test: Backend (Service Role)
    console.log('\n--- 1. Testing Backend Access (Service Role) ---');
    const adminClient = createClient(URL, SERVICE_KEY, { auth: { persistSession: false } });
    const { data: adminData, error: adminError } = await adminClient.from('students').select('count', { count: 'exact', head: true });

    if (adminError) {
        console.error('❌ Backend Access FAILED:', adminError.message);
    } else {
        console.log(`✅ Backend Access Success. Count: ${adminData}`);
    }

    // 2. Negative Test: Frontend (Anon Key)
    console.log('\n--- 2. Testing Public Access (Anon Key) ---');
    const publicClient = createClient(URL, ANON_KEY, { auth: { persistSession: false } });

    const { data: publicData, error: publicError } = await publicClient.from('students').select('*').limit(5);

    if (publicError) {
        console.log(`✅ Public Access Blocked (Expected Error): ${publicError.message}`); // Rare, usually just returns empty [] if RLS hides rows
    } else {
        if (publicData.length === 0) {
            console.log('✅ Public Access Blocked (Returned 0 rows, as expected by RLS).');
        } else {
            console.error('❌ SECURITY FAILURE: Anon key could read data!', publicData);
            process.exit(1);
        }
    }

    // Try Insert
    const { error: insertError } = await publicClient.from('students').insert({ display_name: 'Hacker', grade: '1sec' });
    if (insertError) {
        console.log(`✅ Public Insert Blocked: ${insertError.message}`);
    } else {
        console.error('❌ SECURITY FAILURE: Anon key could insert data!');
    }
}

runTests();
