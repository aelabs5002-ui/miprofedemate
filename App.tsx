import React from 'react';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ProductionHealthScreen } from './src/screens/ProductionHealthScreen';

/**
 * Punto de entrada raíz de la aplicación.
 * El inicio de sesión ahora es manejado por el usuario en la LoginScreen.
 */
const App: React.FC = () => {
  // Production Health Panel route injection
  if (typeof window !== 'undefined' && window.location.pathname === '/admin/system') {
    return <ProductionHealthScreen />;
  }

  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
};

export default App;