import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

console.log('--- CONNECTIVITY CHECK ---');
console.log('URL:', SUPABASE_URL);
console.log('DB:', DATABASE_URL ? 'Defined' : 'Missing');

async function checkRest() {
    console.log('\n1. Checking REST API...');
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data, error } = await supabase.from('test_connection').select('*').limit(1).maybeSingle();
        // It's okay if table doesn't exist, we just want to see if we reach the server (status 404 or 200 or 400, not Connection Refused).
        if (error && error.code !== 'PGRST204' && error.code !== '42P01') {
            // 42P01 is relation does not exist - which means we CONNECTED!
            console.log('✅ REST Connected (Response received):', error.message);
        } else {
            console.log('✅ REST Connected. Data/Error:', error ? error.message : 'OK');
        }
    } catch (e) {
        console.error('❌ REST Failed:', e.message);
    }
}

async function checkDb() {
    console.log('\n2. Checking DB Connection (Postgres)...');
    if (!DATABASE_URL) {
        console.log('⚠️ No DATABASE_URL provided. Skipping DB check.');
        return;
    }
    const client = new pg.Client({ connectionString: DATABASE_URL });
    try {
        await client.connect();
        const res = await client.query('SELECT 1 as connected');
        console.log('✅ DB Connected:', res.rows[0]);
        await client.end();
    } catch (e) {
        console.error('❌ DB Failed:', e.message);
    }
}

async function run() {
    await checkRest();
    await checkDb();
}

run();
