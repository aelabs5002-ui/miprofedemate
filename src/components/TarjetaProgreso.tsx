import React from 'react';

interface Props {
  titulo: string;
  porcentaje: number;
}

/**
 * Componente simple para mostrar el progreso de una materia.
 */
const TarjetaProgreso: React.FC<Props> = ({ titulo, porcentaje }) => {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>{titulo}</span>
        <span style={styles.percent}>{porcentaje}%</span>
      </div>
      <div style={styles.barBackground}>
        <div style={{
          ...styles.barFill,
          width: `${porcentaje}%`
        }} />
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid #E9ECEF',
    marginBottom: '12px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#495057',
  },
  percent: {
    fontSize: '14px',
    color: '#007BFF',
    fontWeight: '700',
  },
  barBackground: {
    height: '8px',
    backgroundColor: '#E9ECEF',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#007BFF',
    borderRadius: '4px',
  }
};

export default TarjetaProgreso;