
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const HOST = 'supabase.tuprofedemate.com';
const PORT = 5432;
const PASS = 'dqycq43nb6gs6onc5xdk9avldyksz0uz';
const DB = 'postgres';

// Potential Users to try
const USER_VARIANTS = [
    'postgres',
    'postgres.your-tenant-id',
    'postgres.stub',
    'postgres.wmjujg',
    'supabase_admin',
    'supabase_admin.your-tenant-id',
    'supabase_admin.wmjujg'
];

async function tryApplyAuthSchema(user) {
    console.log(`Trying User: ${user}...`);
    const client = new pg.Client({
        host: HOST,
        port: PORT,
        user: user,
        password: PASS,
        database: DB,
        connectionTimeoutMillis: 5000
    });

    try {
        await client.connect();
        const sqlPath = path.join(__dirname, '../database/update_schema_auth.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying Auth Schema...');
        await client.query(sql);
        console.log('✅ Auth Schema applied.');

        await client.end();
        return true;
    } catch (e) {
        console.log(`❌ Failed (${user}): ${e.message}`);
        await client.end().catch(() => { });
        return false;
    }
}

async function run() {
    console.log('--- APPLYING AUTH SCHEMA (S-1) ---');
    for (const user of USER_VARIANTS) {
        if (await tryApplyAuthSchema(user)) {
            console.log(`✨ SUCCESS: Auth schema applied using ${user}`);
            process.exit(0);
        }
    }
    console.error('🔥 ALL ATTEMPTS FAILED.');
    process.exit(1);
}

run();
