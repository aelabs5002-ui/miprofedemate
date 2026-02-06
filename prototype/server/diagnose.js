
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const ENV_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- DIAGNOSTIC START ---');
console.log(`1) RAW ENV: '${ENV_URL}'`);

try {
    const parsed = new URL(ENV_URL);
    console.log('   PARSED:');
    console.log(`     Protocol: ${parsed.protocol}`);
    console.log(`     Hostname: ${parsed.hostname}`);
    console.log(`     Port:     ${parsed.port}`);
} catch (e) {
    console.error('   INVALID URL FORMAT:', e.message);
}

console.log('\n3) SUPABASE-JS PROBE:');
async function probe(url) {
    console.log(`   Probing with literal: '${url}'...`);
    const client = createClient(url, KEY, { auth: { persistSession: false } });
    try {
        const { count, error } = await client.from('students').select('*', { count: 'exact', head: true });
        if (error) {
            // Differentiate 'fetch failed' from API error
            if (error.message.includes('fetch failed')) console.log(`   Result: ❌ FETCH FAILED (Network/DNS/Port)`);
            else console.log(`   Result: ⚠️ CONNECTED BUT API ERROR: ${error.message} (Code: ${error.code})`);
        } else {
            console.log(`   Result: ✅ SUCCESS (Count: ${count})`);
        }
    } catch (e) {
        console.log(`   Result: ❌ EXCEPTION: ${e.message}`);
    }
}

async function run() {
    await probe(ENV_URL); // from env
    console.log('--- DIAGNOSTIC END ---');
}

run();
