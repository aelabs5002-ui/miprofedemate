
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
const PASS = 'dqycq43nb6gs6onc5xdk9avldyksz0uz'; // from user prompt
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

async function tryApplySchema(user) {
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
        console.log('✅ Connected!');

        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Applying Schema...');
        await client.query(schemaSql);
        console.log('✅ Schema Applied Successfully.');

        // Verify
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables in public:', res.rows.map(r => r.table_name).join(', '));

        await client.end();
        return true;
    } catch (e) {
        console.log(`❌ Failed (${user}): ${e.message}`);
        await client.end().catch(() => { });
        return false;
    }
}

async function run() {
    console.log('--- APPLYING SCHEMA ---');
    for (const user of USER_VARIANTS) {
        if (await tryApplySchema(user)) {
            console.log('✨ SUCCESS: Schema applied.');
            process.exit(0);
        }
    }
    console.error('🔥 ALL ATTEMPTS FAILED. Could not apply schema.');
    process.exit(1);
}

run();
