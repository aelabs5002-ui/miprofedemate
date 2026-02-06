import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Variants to try
const REST_URLS = [
    process.env.SUPABASE_URL, // http://...:8000
    'https://supabase.tuprofedemate.com' // https standard
];

// DB Variants
const BASE_DB_CONFIG = {
    host: 'supabase.tuprofedemate.com',
    port: 5432,
    password: 'dqycq43nb6gs6onc5xdk9avldyksz0uz',
    database: 'postgres'
};

const DB_USERS = [
    'postgres',                     // Standard
    'postgres.stub',                // Common self-hosted default
    'postgres.your-tenant-id',      // Template default
    'postgres.wmjujg',              // Extracted from container prefix
    'postgres.public'               // Sometimes schema? Likely not.
];

console.log('--- ADVANCED CONNECTIVITY CHECK ---');

async function testRest(url) {
    if (!url) return;
    console.log(`\nTesting REST: ${url}`);
    try {
        const supabase = createClient(url, SUPABASE_KEY, {
            auth: { persistSession: false }
        });
        const { data, error } = await supabase.from('students').select('count', { count: 'exact', head: true });

        if (error && error.code === 'PGRST100') { // connection error lookalikes or 404
            if (error.message.includes('fetch failed')) throw new Error('Fetch failed');
            // If table missing, we get 404 code 42P01 usually.
            console.log(`✅ REST Connected! (API responded: ${error.message})`);
            return true;
        } else if (error && error.code) {
            console.log(`✅ REST Connected! (API responded: ${error.code} - ${error.message})`);
            return true;
        } else {
            console.log('✅ REST Connected! (Success)');
            return true;
        }
    } catch (e) {
        console.log(`❌ REST Failed (${url}): ${e.message}`);
        return false;
    }
}

async function testDb(user) {
    const config = { ...BASE_DB_CONFIG, user };
    console.log(`\nTesting DB User: ${user}`);
    const client = new pg.Client(config);
    try {
        await client.connect();
        const res = await client.query('SELECT version()');
        console.log(`✅ DB Success! Connected as ${user}. Version: ${res.rows[0].version.substring(0, 20)}...`);
        await client.end();
        return true;
    } catch (e) {
        console.log(`❌ DB Failed (${user}): ${e.message}`);
        if (client.end) client.end().catch(() => { });
        return false;
    }
}

async function run() {
    // 1. Check REST
    for (const url of REST_URLS) {
        if (await testRest(url)) break;
    }

    // 2. Check DB
    for (const user of DB_USERS) {
        if (await testDb(user)) break;
    }
}

run();
