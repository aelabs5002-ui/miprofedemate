export type ErrorTag =
    | 'signos'
    | 'operaciones_basicas'
    | 'fracciones'
    | 'despeje'
    | 'distribucion'
    | 'igualdad'
    | 'orden_operaciones'
    | 'otro';

export function detectErrorTag(opts: {
    userAnswer: string;
    expectedAnswer: string;
    prompt?: string;
}): ErrorTag {
    const { userAnswer, expectedAnswer, prompt } = opts;
    const userTrimmed = userAnswer.trim();
    const expectedTrimmed = expectedAnswer.trim();

    // 1. Vacío
    if (!userTrimmed) return 'otro';

    // 2. Caracteres no matemáticos (simple check, allow x, y, m, numbers, operators)
    // Si contiene letras que no sean las típicas variables, asumimos 'otro' (o typo)
    if (/[^0-9xym\+\-\*\/\=\.\(\)\s]/.test(userTrimmed)) {
        // A slightly permissive regex, but if it has weird text:
        return 'otro';
    }

    const userNum = parseFloat(userTrimmed);
    const expectedNum = parseFloat(expectedTrimmed);
    const userIsNum = !isNaN(userNum);
    const expectedIsNum = !isNaN(expectedNum);

    // 3. Signos
    // Si ambos son números y diff absoluto es igual (es decir valor absoluto igual, pero distintos)
    if (userIsNum && expectedIsNum) {
        if (Math.abs(userNum) === Math.abs(expectedNum) && userNum !== expectedNum) {
            return 'signos';
        }
    }

    // 4. Fracciones
    // Si expected tiene '/' y user no, o si expected es decimal largo y user no coincide
    if (expectedTrimmed.includes('/') && !userTrimmed.includes('/')) {
        return 'fracciones';
    }
    // Si user intenta poner fraccion 1/2 y la respuesta es 0.5 (o viceversa, pero aqui el user erró)
    if (userTrimmed.includes('/') && expectedIsNum) {
        // Check if value matches but format diff? No, this function is only called on INCORRECT answers.
        // So if user put fraction and got it wrong, maybe calculation error involving fraction
        return 'fracciones';
    }

    const promptLower = (prompt || '').toLowerCase();

    // 6. Distribución (Chequear antes de despeje si hay keywords fuertes)
    if (promptLower.includes('distribu') || promptLower.includes('parentesis') || promptLower.includes('paréntesis')) {
        return 'distribucion';
    }

    // 5. Despeje / Igualdad
    // Patrones de ecuación
    if (promptLower.includes('=') || promptLower.includes('despej')) {
        // Si el usuario puso un número pero se pedia expresión, o calculo mal
        return 'despeje';
    }

    // 7. Operaciones Básicas
    // Fallback para errores numéricos simples
    if (userIsNum && expectedIsNum) {
        return 'operaciones_basicas';
    }

    // 8. Default
    return 'otro';
}
