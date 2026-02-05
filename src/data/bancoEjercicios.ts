export interface Ejercicio {
    id: string;
    enunciado: string;
    respuestaEsperada: string;
    pista: string;
    tema: string;
}

export const BANCO_EJERCICIOS: Record<string, Ejercicio[]> = {
    'Ecuaciones lineales': [
        {
            id: 'eq_lin_1',
            enunciado: 'Resuelve para x: 3x - 5 = 10',
            respuestaEsperada: '5',
            pista: 'Suma 5 a ambos lados, luego divide por 3.',
            tema: 'Ecuaciones lineales'
        },
        {
            id: 'eq_lin_2',
            enunciado: 'Encuentra el valor de m: 2m + 4 = 12',
            respuestaEsperada: '4',
            pista: 'Resta 4 a ambos lados, luego divide por 2.',
            tema: 'Ecuaciones lineales'
        },
        {
            id: 'eq_lin_3',
            enunciado: 'Resuelve la ecuación: 5y = 20',
            respuestaEsperada: '4',
            pista: 'Divide ambos lados por 5.',
            tema: 'Ecuaciones lineales'
        },
        {
            id: 'eq_lin_4',
            enunciado: 'Si x/2 = 6, ¿cuánto vale x?',
            respuestaEsperada: '12',
            pista: 'Multiplica ambos lados por 2.',
            tema: 'Ecuaciones lineales'
        },
        {
            id: 'eq_lin_5',
            enunciado: 'Resuelve: 4x + 1 = 9',
            respuestaEsperada: '2',
            pista: 'Resta 1 a ambos lados y luego divide por 4.',
            tema: 'Ecuaciones lineales'
        },
        {
            id: 'eq_lin_6',
            enunciado: 'Resuelve para z: 3z - 7 = 8',
            respuestaEsperada: '5',
            pista: 'Suma 7 a ambos lados, luego divide por 3.',
            tema: 'Ecuaciones lineales'
        }
    ]
};
