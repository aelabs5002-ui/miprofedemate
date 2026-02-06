
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const HOST = 'supabase.tuprofedemate.com';
const PORT = 5432;
const PASS = 'dqycq43nb6gs6onc5xdk9avldyksz0uz';
const DB = 'postgres';
const USER = 'postgres.your-tenant-id'; // Known good user from prev step

async function verify() {
    console.log('🔍 Verifying Auth Schema...');
    const client = new pg.Client({
        host: HOST,
        port: PORT,
        user: USER,
        password: PASS,
        database: DB
    });

    try {
        await client.connect();

        // 1. Check parents table
        const resParents = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'parents'
        `);
        const parentsExists = resParents.rows.length > 0;
        console.log(`Table 'parents': ${parentsExists ? '✅ Exists' : '❌ MISSING'}`);

        // 2. Check students.parent_id column
        const resCol = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'students' AND column_name = 'parent_id'
        `);
        const colExists = resCol.rows.length > 0;
        console.log(`Column 'students.parent_id': ${colExists ? '✅ Exists' : '❌ MISSING'}`);

        // 3. Check RLS on parents
        const resRLS = await client.query(`
            SELECT tablename, rowsecurity 
            FROM pg_tables 
            WHERE tablename = 'parents'
        `);
        const rlsEnabled = resRLS.rows[0]?.rowsecurity;
        console.log(`RLS on 'parents': ${rlsEnabled ? '✅ Enabled' : '❌ DISABLED'}`);

        await client.end();
    } catch (e) {
        console.error('Verify failed:', e);
        await client.end().catch(() => { });
    }
}

verify();
