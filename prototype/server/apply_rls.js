
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

// Potential Users to try (Supavisor needs tenant.user or just user)
const USER_VARIANTS = [
    'postgres',
    'postgres.your-tenant-id', // Literal from provided docker-compose
    'postgres.stub',           // Common default
    'postgres.wmjujg',         // Derived from container prefix
    'supabase_admin',
    'supabase_admin.your-tenant-id',
    'supabase_admin.wmjujg'
];

async function tryApplyRLS(user) {
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
        const sqlPath = path.join(__dirname, '../database/enable_rls.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);
        console.log('✅ RLS Enabled on all tables.');

        // Check status
        const res = await client.query(`
            SELECT tablename, rowsecurity 
            FROM pg_tables 
            WHERE schemaname = 'public';
        `);
        console.table(res.rows);

        await client.end();
        return true;
    } catch (e) {
        console.log(`❌ Failed (${user}): ${e.message}`);
        await client.end().catch(() => { });
        return false;
    }
}

async function run() {
    console.log('--- APPLYING RLS ---');
    for (const user of USER_VARIANTS) {
        if (await tryApplyRLS(user)) {
            console.log('✨ SUCCESS: RLS applied by user ' + user);
            process.exit(0);
        }
    }
    console.error('🔥 ALL ATTEMPTS FAILED. Could not apply RLS.');
    process.exit(1);
}

run();
