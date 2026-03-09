import React, { useEffect, useState } from 'react';
import { HealthCheckItem } from '../types/health';
import { runHealthCheck } from '../services/health/healthCheck';

export const ProductionHealthScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<HealthCheckItem[]>([]);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const startCheck = async () => {
    setLoading(true);
    try {
      const currentChecks = await runHealthCheck();
      setResults(currentChecks);
    } catch (e) {
      console.error('Fatal error during health check', e);
    } finally {
      setLastChecked(new Date().toLocaleTimeString());
      setLoading(false);
    }
  };

  useEffect(() => {
    startCheck();
  }, []);

  const renderBadge = (status: 'ok' | 'warn' | 'fail') => {
    let bgColor = '#333';
    if (status === 'ok') bgColor = '#2e7d32'; // Green
    if (status === 'warn') bgColor = '#ed6c02'; // Orange
    if (status === 'fail') bgColor = '#d32f2f'; // Red

    return (
      <span
        style={{
          backgroundColor: bgColor,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Production Health Panel</h1>
        <p style={styles.subtitle}>
          System Diagnostic Interface. Isolated Mode.
        </p>
      </header>

      <main style={styles.content}>
        <div style={styles.actions}>
          <button
            onClick={startCheck}
            disabled={loading}
            style={loading ? { ...styles.button, opacity: 0.7, cursor: 'not-allowed' } : styles.button}
          >
            {loading ? 'Comprobando...' : 'Reintentar diagnóstico'}
          </button>
          {lastChecked && (
            <span style={styles.timestamp}>Última revisión: {lastChecked}</span>
          )}
        </div>

        {loading && results.length === 0 ? (
          <div style={styles.loadingBox}>Corriendo auditoría inicial...</div>
        ) : (
          <div style={styles.grid}>
            {results.map((check) => (
              <div key={check.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{check.label}</h3>
                  {renderBadge(check.status)}
                </div>
                <p style={styles.cardMessage}>{check.message}</p>
                <div style={styles.cardFooter}>
                  {check.latencyMs !== undefined ? (
                    <span style={styles.latency}>Latencia: {check.latencyMs}ms</span>
                  ) : (
                    <span></span>
                  )}
                  <span style={styles.checkedAt}>
                    {new Date(check.checkedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#121212',
    color: '#e0e0e0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    padding: '20px',
    boxSizing: 'border-box' as const,
    overflowY: 'auto' as const,
  },
  header: {
    borderBottom: '1px solid #333',
    paddingBottom: '20px',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: '#ffffff',
  },
  subtitle: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    color: '#888',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  timestamp: {
    fontSize: '13px',
    color: '#aaa',
  },
  loadingBox: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#aaa',
    border: '1px dashed #444',
    borderRadius: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#1e1e1e',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600' as const,
  },
  cardMessage: {
    margin: 0,
    fontSize: '14px',
    color: '#ccc',
    lineHeight: '1.4',
    wordBreak: 'break-word' as const,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    fontSize: '12px',
    color: '#888',
  },
  latency: {
    fontFamily: 'monospace',
  },
  checkedAt: {},
};
