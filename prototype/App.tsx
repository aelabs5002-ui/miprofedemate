import React from 'react';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { BUILD_ID } from './src/build';

/**
 * Punto de entrada raíz de la aplicación.
 * El inicio de sesión ahora es manejado por el usuario en la LoginScreen.
 */
const App: React.FC = () => {
  const buildId = BUILD_ID;

  return (
    <AppProvider>
      <AppNavigator />
      <div style={{
        position: 'fixed',
        bottom: '12px',
        left: '12px',
        zIndex: 9999,
        opacity: 0.5,
        pointerEvents: 'none',
        color: '#888',
        fontSize: '10px',
        fontFamily: 'monospace',
        mixBlendMode: 'difference'
      }}>
        BUILD: {buildId}
      </div>
    </AppProvider>
  );
};

export default App;