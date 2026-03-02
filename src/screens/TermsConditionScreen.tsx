import React from 'react';

interface Props {
    alVolver: () => void;
}

const TermsConditionScreen: React.FC<Props> = ({ alVolver }) => {
    return (
        <div style={{ padding: '20px', backgroundColor: '#0F231B', color: 'white', height: '100vh' }}>
            <h1>Términos y Condiciones</h1>
            <p>Acepta los términos para continuar.</p>
            <button onClick={alVolver} style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}>
                Volver
            </button>
        </div>
    );
};

export default TermsConditionScreen;
