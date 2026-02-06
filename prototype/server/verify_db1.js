
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const HOST = 'supabase.tuprofedemate.com';
const PORT = 5432;
const PASS = 'dqycq43nb6gs6onc5xdk9avldyksz0uz';
const DB = 'postgres';
const USER = 'postgres.your-tenant-id'; // Known good user from prev step

async function verifyDB1() {
    console.log('🔍 Verifying DB-1 Schema & Implementation...');
    const client = new pg.Client({
        host: HOST,
        port: PORT,
        user: USER,
        password: PASS,
        database: DB
    });

    try {
        await client.connect();

        // 1. Check error_tag column
        const resCol = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'attempts' AND column_name = 'error_tag'
        `);
        const colExists = resCol.rows.length > 0;
        console.log(`Column 'attempts.error_tag': ${colExists ? '✅ Exists' : '❌ MISSING (Schema Update Failed)'}`);

        // 2. Check if feedback column still exists (it should, but we don't write to it)
        const resFb = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'attempts' AND column_name = 'feedback'
        `);
        // We aren't dropping the column, just not using it.
        // Confirming it exists is fine.

        await client.end();
    } catch (e) {
        console.error('Verify DB-1 failed:', e);
        await client.end().catch(() => { });
    }
}

verifyDB1();
