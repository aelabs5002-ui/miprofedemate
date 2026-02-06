import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function verifyMotor() {
    console.log('🧪 Testing MOTOR (Mission Builder)...');
    try {
        const res = await fetch(`${BASE_URL}/api/mission/build`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: 'test-student-1',
                type: 'practica',
                grade: '3prim',
                topics: ['sumas', 'restas'],
                description: 'Quiero practicar para mi examen'
            })
        });

        const data = await res.json();
        console.log('✅ status:', res.status);
        if (data.mission_steps) {
            console.log('✅ Steps generated:', data.mission_steps.length);
            console.log('🔍 First step:', JSON.stringify(data.mission_steps[0], null, 2));
        } else {
            console.error('❌ Invalid response:', data);
        }
    } catch (e) {
        console.error('❌ Failed:', e.message);
    }
}

async function verifyTutor() {
    console.log('\n🧪 Testing TUTOR (Step Guidance)...');
    try {
        const res = await fetch(`${BASE_URL}/api/tutor/step`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: 'test-student-1',
                missionId: 'm-123',
                stepId: 's-1',
                content: {
                    question: 'Cuanto es 2 + 2?',
                    correctAnswer: '4'
                },
                studentAnswer: '5 (error intencional)',
                grade: '1prim'
            })
        });

        const data = await res.json();
        console.log('✅ status:', res.status);
        console.log('🔍 Response:', JSON.stringify(data, null, 2));

    } catch (e) {
        console.error('❌ Failed:', e.message);
    }
}

async function run() {
    await verifyMotor();
    await verifyTutor();
}

run();
