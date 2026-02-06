
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HOST = 'supabase.tuprofedemate.com';
const PORT = 5432;
const PASS = 'dqycq43nb6gs6onc5xdk9avldyksz0uz';
const DB = 'postgres';

// We reuse the known working user or iterate again if needed.
// Based on previous steps, 'postgres.your-tenant-id' seemed to work.
const USER_VARIANTS = [
    'postgres.your-tenant-id',
    'postgres',
    'postgres.stub',
    'postgres.wmjujg',
    'supabase_admin'
];

async function tryApplyDB1(user) {
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
        const sqlPath = path.join(__dirname, '../database/update_schema_db1.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying DB-1 Schema...');
        await client.query(sql);
        console.log('✅ DB-1 Schema applied.');

        await client.end();
        return true;
    } catch (e) {
        console.log(`❌ Failed (${user}): ${e.message}`);
        await client.end().catch(() => { });
        return false;
    }
}

async function run() {
    console.log('--- APPLYING DB-1 SCHEMA ---');
    for (const user of USER_VARIANTS) {
        if (await tryApplyDB1(user)) {
            console.log(`✨ SUCCESS: DB-1 schema applied using ${user}`);
            process.exit(0);
        }
    }
    console.error('🔥 ALL ATTEMPTS FAILED.');
    process.exit(1);
}

run();
