import React, { ReactNode } from 'react';

interface BaseLayoutProps {
  titulo: string;
  children: ReactNode;
  mostrarAtras?: boolean;
}

/**
 * Componente base que simula la estructura de una pantalla móvil estándar.
 * Incluye una cabecera (Header) y un área de contenido (Body).
 */
const BaseLayout: React.FC<BaseLayoutProps> = ({ titulo, children, mostrarAtras = false }) => {
  return (
    <div style={styles.container}>
      {/* Cabecera Móvil */}
      <header style={styles.header}>
        {mostrarAtras && <button style={styles.backButton}>←</button>}
        <h1 style={styles.headerTitle}>{titulo}</h1>
      </header>

      {/* Cuerpo de la pantalla */}
      <main style={styles.content}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    width: '100%',
    backgroundColor: '#F8F9FA',
    fontFamily: 'sans-serif',
  },
  header: {
    height: '60px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E0E0E0',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
    color: '#212529',
  },
  backButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    marginRight: '12px',
    cursor: 'pointer',
  },
  content: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '16px',
  },
};

export default BaseLayout;