import React from 'react';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Punto de entrada raíz de la aplicación.
 * El inicio de sesión ahora es manejado por el usuario en la LoginScreen.
 */
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
};

export default App;