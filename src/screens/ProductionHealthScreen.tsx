import React, { useEffect, useState } from 'react';
import { HealthCheckItem } from '../types/health';
import { runHealthCheck } from '../services/health/healthCheck';

export const ProductionHealthScreen: React.FC = () => {
  const [checks, setChecks] = useState<HealthCheckItem[]>([]);
  const [loading, setLoading] = useState(false);

  const startCheck = () => {
    setLoading(true);
    setChecks([]);
    runHealthCheck().then((data) => {
      setChecks(data);
      setLoading(false);
    }).catch((e) => {
      console.error(e);
      setLoading(false);
    });
  };

  useEffect(() => {
    startCheck();
  }, []);

  const renderBadge = (status: string) => {
    let bgColor = '#333';
    if (status === 'ok') bgColor = '#2e7d32'; // Green
    if (status === 'warn') bgColor = '#ed6c02'; // Orange
    if (status === 'fail') bgColor = '#d32f2f'; // Red
    if (status === 'CHECKING...') bgColor = '#555'; // Gray

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

  const placeholders = [
    { id: 'BUILD', category: 'INFRASTRUCTURE', label: 'BUILD', status: 'CHECKING...' as any, message: 'Ejecutando diagnóstico...', latencyMs: undefined },
    { id: 'BUILDTXT', category: 'INFRASTRUCTURE', label: 'build.txt', status: 'CHECKING...' as any, message: 'Ejecutando diagnóstico...', latencyMs: undefined },
    { id: 'SUPABASE', category: 'INFRASTRUCTURE', label: 'Supabase', status: 'CHECKING...' as any, message: 'Ejecutando diagnóstico...', latencyMs: undefined },
    { id: 'ENV', category: 'INFRASTRUCTURE', label: 'Environment', status: 'CHECKING...' as any, message: 'Ejecutando diagnóstico...', latencyMs: undefined },
    { id: 'STORAGE', category: 'SERVICES', label: 'Storage', status: 'CHECKING...' as any, message: 'Ejecutando diagnóstico...', latencyMs: undefined },
    { id: 'EDGE_FUNCTIONS', category: 'SERVICES', label: 'Edge Functions', status: 'CHECKING...' as any, message: 'Ejecutando diagnóstico...', latencyMs: undefined },
    { id: 'UPLOAD_PATH', category: 'SERVICES', label: 'Upload Path', status: 'CHECKING...' as any, message: 'Ejecutando diagnóstico...', latencyMs: undefined },
    { id: 'OCR_ANALYZE', category: 'TUTOR FLOW', label: 'OCR / Analyze', status: 'CHECKING...' as any, message: 'Ejecutando diagnóstico...', latencyMs: undefined },
    { id: 'MISSION_ENGINE', category: 'TUTOR FLOW', label: 'Mission Engine', status: 'CHECKING...' as any, message: 'Ejecutando diagnóstico...', latencyMs: undefined },
    { id: 'TUTOR_START_CONTRACT', category: 'TUTOR FLOW', label: 'Tutor Start Contract', status: 'CHECKING...' as any, message: 'Ejecutando diagnóstico...', latencyMs: undefined },
  ];

  const displayChecks = checks.length > 0 ? checks : placeholders as HealthCheckItem[];

  const grouped = displayChecks.reduce((acc, check) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, HealthCheckItem[]>);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Production Health Panel</h1>
          <p style={styles.subtitle}>System Diagnostic Interface. Isolated Mode.</p>
        </div>
        <button
          onClick={startCheck}
          disabled={loading}
          style={loading ? { ...styles.button, opacity: 0.7, cursor: 'not-allowed' } : styles.button}
        >
          {loading ? 'Comprobando...' : 'Reintentar'}
        </button>
      </header>

      <main style={styles.content}>

        <div style={styles.sectionsContainer}>
          {['INFRASTRUCTURE', 'SERVICES', 'TUTOR FLOW'].map((category) => {
            const categoryChecks = grouped[category] || [];
            if (categoryChecks.length === 0) return null;
            return (
              <section key={category} style={styles.section}>
                <h2 style={styles.sectionTitle}>{category}</h2>
                <div style={styles.grid}>
                  {categoryChecks.map((check) => (
                    <div key={check.id} style={styles.card}>
                      <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>{check.label || check.id}</h3>
                        {renderBadge(check.status)}
                      </div>
                      <p style={styles.cardMessage}>{check.message}</p>
                      <div style={styles.cardFooter}>
                        {check.latencyMs !== undefined ? (
                          <span style={styles.latency}>Latencia: {check.latencyMs}ms</span>
                        ) : (
                          <span></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    paddingTop: '40px',
    paddingBottom: '40px',
    backgroundColor: '#121212',
    color: '#e0e0e0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    boxSizing: 'border-box' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #333',
    paddingBottom: '20px',
    marginBottom: '24px',
    width: '100%',
    maxWidth: '600px',
    padding: '0 20px',
    boxSizing: 'border-box' as const,
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700' as const,
    color: '#ffffff',
    lineHeight: '1.2',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#888',
  },
  content: {
    maxWidth: '600px',
    width: '100%',
    padding: '0 20px',
    boxSizing: 'border-box' as const,
  },
  button: {
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '13px',
    transition: 'background-color 0.2s',
  },
  sectionsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '30px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700' as const,
    color: '#aaa',
    textTransform: 'uppercase' as const,
    paddingBottom: '8px',
    borderBottom: '1px solid #333',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    justifyItems: 'stretch',
    width: '100%',
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
    width: '100%',
    boxSizing: 'border-box' as const,
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
    textTransform: 'uppercase' as const,
    color: '#4db8ff',
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 'auto',
    fontSize: '13px',
    color: '#888',
  },
  latency: {
    fontFamily: 'monospace',
    color: '#aa88ff',
  },
};
