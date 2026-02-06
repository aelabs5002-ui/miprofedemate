import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 3001}`;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runTest() {
    console.log('🧪 Starting End-to-End Test (API + Supabase)...');

    // 1. Get a Student
    const { data: student, error: sErr } = await supabase.from('students').select('id').limit(1).single();
    if (sErr || !student) {
        console.error('❌ No student found. Run seed_data.js first.');
        process.exit(1);
    }
    const studentId = student.id;
    console.log(`👤 Using Student: ${studentId}`);

    // 2. Create Mission (Call API)
    console.log('📡 Calling POST /api/mission/build...');
    const start = Date.now();

    // Fake request
    const missionReq = {
        studentId,
        type: 'practica',
        grade: '1sec',
        topics: ['algebra_basica']
    };

    try {
        const res = await fetch(`${API_URL}/api/mission/build`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(missionReq)
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`API Error ${res.status}: ${txt}`);
        }

        const plan = await res.json();
        const duration = Date.now() - start;
        console.log(`✅ Mission Created in ${duration}ms`);
        console.log(`   ID: ${plan.id}`);
        console.log(`   Pasos: ${plan.mission_steps.length}`);

        if (!plan.id || !plan.id.includes('-')) {
            console.error('❌ Invalid Mission ID format (expected UUID)');
        }

        // 3. Validate Persistence (Check DB)
        const { data: dbMission } = await supabase.from('missions').select('*').eq('id', plan.id).single();
        if (dbMission) console.log('✅ Mission confirmed in DB');
        else console.error('❌ Mission NOT found in DB!');

        // 4. Simulate Tutor Attempt (Call API)
        if (plan.mission_steps.length > 0) {
            const firstStep = plan.mission_steps[0];
            const stepId = firstStep.id; // UUID from DB
            console.log(`📡 Calling POST /api/tutor/step for Step ${stepId}...`);

            const tutorReq = {
                missionId: plan.id,
                stepId: stepId,
                studentId,
                content: firstStep,
                studentAnswer: "Respuesta de prueba 123"
            };

            const res2 = await fetch(`${API_URL}/api/tutor/step`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tutorReq)
            });

            const feedback = await res2.json();
            console.log('✅ Tutor Feedback:', feedback.nextAction);

            // 5. Validate Attempt Persistence
            const { count } = await supabase.from('attempts').select('*', { count: 'exact', head: true }).eq('step_id', stepId);
            console.log(`✅ Attempts recorded in DB for this step: ${count}`);
        }

    } catch (e) {
        console.error('❌ TEST FAILED:', e);
    }
}

runTest();
