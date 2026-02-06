import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL; // http://...:8000
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
});

async function seed() {
    console.log('🌱 Seeding specific test data (Idempotent-ish)...');

    // 1. Create Students
    const students = [
        { display_name: 'Juan Perez', grade: '1sec' },
        { display_name: 'Maria Garcia', grade: '3prim' },
        { display_name: 'Carlos Lopez', grade: '2sec' },
        { display_name: 'Ana Martinez', grade: '6prim' }
    ];

    const studentIds = [];

    for (const s of students) {
        // Check if exists to avoid dupes in repeated runs
        const { data: existing } = await supabase.from('students').select('id').eq('display_name', s.display_name).maybeSingle();

        let sId;
        if (existing) {
            sId = existing.id;
            console.log(`Student ${s.display_name} exists: ${sId}`);
        } else {
            const { data, error } = await supabase.from('students').insert(s).select().single();
            if (error) { console.error('Error creating student:', error); continue; }
            sId = data.id;
            console.log(`Created Student ${s.display_name}: ${sId}`);
        }
        studentIds.push(sId);
    }

    if (studentIds.length === 0) return;

    // 2. Create Mission for First Student
    const studentId = studentIds[0];
    const { data: mission, error: mError } = await supabase.from('missions').insert({
        student_id: studentId,
        origin: 'seed',
        status: 'pending',
        title: 'Misión de Prueba Inicial',
        description: 'Misión generada por seed script'
    }).select().single();

    if (mError) {
        console.error('Error creating mission:', mError);
        return;
    }
    console.log(`Created Mission: ${mission.id}`);

    // 3. Create Steps
    const stepsData = [
        { mission_id: mission.id, step_index: 0, content: { question: '2+2', answer: '4' } },
        { mission_id: mission.id, step_index: 1, content: { question: '5*5', answer: '25' } },
        { mission_id: mission.id, step_index: 2, content: { question: '10/2', answer: '5' } }
    ];

    const { data: steps, error: sError } = await supabase.from('mission_steps').insert(stepsData).select();
    if (sError) console.error('Error creating steps:', sError);
    else console.log(`Created ${steps.length} steps`);

    // 4. Create Attempt
    if (steps && steps.length > 0) {
        await supabase.from('attempts').insert({
            step_id: steps[0].id,
            student_id: studentId,
            user_input: '3',
            is_correct: false,
            feedback: 'Casi, intenta sumar 1 más.'
        });
        console.log('Created Attempt');
    }

    console.log('✅ Seed completed.');
}

seed();
