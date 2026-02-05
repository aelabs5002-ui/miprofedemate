export interface MotorAProblem {
    id: string;
    prompt: string;       // "7 + 5 = ?"
    expected: string;     // "12"
    kind: 'ops' | 'frac';
    difficulty: number;
}

export const MotorAService = {
    buildMotorAProblems: (opts: {
        n: number;
        difficulty: number;
        focus?: string[];
    }): MotorAProblem[] => {
        const { n, difficulty, focus } = opts;
        const problems: MotorAProblem[] = [];

        for (let i = 0; i < n; i++) {
            // Mezclar tipos
            let kind: 'ops' | 'frac' = 'ops';
            if (focus && focus.includes('fracciones') && i % 2 === 0) {
                kind = 'frac';
            }

            problems.push(generateProblem(i, difficulty, kind));
        }

        return problems;
    }
};

function generateProblem(index: number, difficulty: number, kind: 'ops' | 'frac'): MotorAProblem {
    const id = `ma_${Date.now()}_${index}`;

    if (kind === 'frac') {
        // Fracciones básicas
        if (difficulty <= 2) {
            // Eqv simple: 1/2 = ?/4
            return {
                id,
                prompt: 'Completa: 1/2 = ?/4',
                expected: '2',
                kind, difficulty
            };
        } else {
            // Suma simple: 1/2 + 1/2 = ?
            return {
                id,
                prompt: 'Calcula: 1/2 + 1/4 = ?',
                expected: '3/4',
                kind, difficulty
            };
        }
    }

    // Aritmética básica
    let prompt = '';
    let expected = '';

    // Rango de números según dificultad
    const max = difficulty <= 2 ? 20 : (difficulty === 3 ? 50 : 100);
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;

    // Operación aleatoria
    const op = Math.random();
    if (op < 0.4) {
        prompt = `${a} + ${b} = ?`;
        expected = String(a + b);
    } else if (op < 0.8) {
        // Resta segura
        const big = Math.max(a, b);
        const small = Math.min(a, b);
        prompt = `${big} - ${small} = ?`;
        expected = String(big - small);
    } else {
        // Mult simple (números más chicos)
        const ma = Math.floor(Math.random() * 12) + 1;
        const mb = Math.floor(Math.random() * 12) + 1;
        prompt = `${ma} x ${mb} = ?`;
        expected = String(ma * mb);
    }

    return {
        id,
        prompt,
        expected,
        kind,
        difficulty
    };
}
