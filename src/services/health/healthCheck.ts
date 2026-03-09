import { BUILD_ID } from '../../build';
import { supabase, edgeApi } from '../../servicios/edgeApi';
import { HealthCheckItem, HealthStatus, HealthCategory } from '../../types/health';

function createCheck(
  id: string,
  category: HealthCategory,
  label: string,
  status: HealthStatus,
  message: string,
  latencyMs?: number
): HealthCheckItem {
  return {
    id,
    category,
    label,
    status,
    message,
    latencyMs,
    checkedAt: new Date().toISOString(),
  };
}

export async function runHealthCheck(): Promise<HealthCheckItem[]> {
  const checks: HealthCheckItem[] = [];

  // ============================================
  // A. INFRASTRUCTURE
  // ============================================

  // 1 & 2. BUILD and build.txt CHECKS
  const startBuildTxt = performance.now();
  try {
    const buildResp = await fetch('/build.txt');
    const latencyBuildTxt = Math.round(performance.now() - startBuildTxt);
    
    if (buildResp.ok) {
        const text = await buildResp.text();
        checks.push(createCheck('buildtxt', 'INFRASTRUCTURE', 'build.txt', 'ok', '200 OK', latencyBuildTxt));
        
        const match = text.match(/BUILD_ID=([^\r\n]+)/);
        if (match && match[1]) {
            checks.push(createCheck('build', 'INFRASTRUCTURE', 'BUILD', 'ok', match[1]));
        } else {
            checks.push(createCheck('build', 'INFRASTRUCTURE', 'BUILD', 'warn', 'Missing BUILD_ID in file'));
        }
    } else {
        checks.push(createCheck('buildtxt', 'INFRASTRUCTURE', 'build.txt', 'fail', `Failed with status ${buildResp.status}`, latencyBuildTxt));
        checks.push(createCheck('build', 'INFRASTRUCTURE', 'BUILD', 'fail', 'Could not fetch /build.txt'));
    }
  } catch (error: any) {
    const latencyBuildTxt = Math.round(performance.now() - startBuildTxt);
    checks.push(createCheck('buildtxt', 'INFRASTRUCTURE', 'build.txt', 'fail', error.message, latencyBuildTxt));
    checks.push(createCheck('build', 'INFRASTRUCTURE', 'BUILD', 'fail', error.message));
  }

  // 3. SUPABASE CHECK
  const startSupa = performance.now();
  try {
    const { error } = await supabase.auth.getSession();
    const latencySupa = Math.round(performance.now() - startSupa);
    if (error) {
       checks.push(createCheck('supabase', 'INFRASTRUCTURE', 'Supabase', 'fail', error.message, latencySupa));
    } else {
        checks.push(createCheck('supabase', 'INFRASTRUCTURE', 'Supabase', 'ok', 'Connected', latencySupa));
    }
  } catch (error: any) {
       const latencySupa = Math.round(performance.now() - startSupa);
       checks.push(createCheck('supabase', 'INFRASTRUCTURE', 'Supabase', 'fail', error.message, latencySupa));
  }
  
  // 4. ENV CHECK
  const supabaseUrlRaw = (import.meta as any).env?.VITE_SUPABASE_URL;
  const anonKeyRaw = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrlRaw && anonKeyRaw) {
      checks.push(createCheck('env', 'INFRASTRUCTURE', 'Environment', 'ok', 'Keys present'));
  } else {
      checks.push(createCheck('env', 'INFRASTRUCTURE', 'Environment', 'warn', 'Keys missing'));
  }

  // ============================================
  // B. SERVICES
  // ============================================

  // 5. STORAGE
  const startStorage = performance.now();
  let isStorageUp = false;
  try {
    // Read-only minimal call to bucket list to verify reachability
    const { error } = await supabase.storage.getBucket('diagnostic');
    const latency = Math.round(performance.now() - startStorage);
    // Even if it returns 404/NotFoundError or 403, the service API is up.
    // If it's a network error/timeout it will throw.
    if (error && error.message.includes('Failed to fetch')) {
        checks.push(createCheck('storage', 'SERVICES', 'Storage', 'fail', 'Network Error', latency));
    } else {
        isStorageUp = true;
        checks.push(createCheck('storage', 'SERVICES', 'Storage', 'ok', 'API Reachable', latency));
    }
  } catch (err: any) {
    checks.push(createCheck('storage', 'SERVICES', 'Storage', 'fail', err.message, Math.round(performance.now() - startStorage)));
  }

  // 6. EDGE FUNCTIONS
  const startEdge = performance.now();
  let isEdgeUp = false;
  try {
      if (supabaseUrlRaw) {
          // Minimal non-destructive reachability ping to the global functions mount
          const res = await fetch(`${supabaseUrlRaw}/functions/v1/`, { method: 'OPTIONS' });
          const latency = Math.round(performance.now() - startEdge);
          isEdgeUp = true;
          checks.push(createCheck('edge_functions', 'SERVICES', 'Edge Functions', 'ok', 'Runtime reachable', latency));
      } else {
          checks.push(createCheck('edge_functions', 'SERVICES', 'Edge Functions', 'fail', 'Missing URL config', 0));
      }
  } catch (err: any) {
      checks.push(createCheck('edge_functions', 'SERVICES', 'Edge Functions', 'fail', err.message, Math.round(performance.now() - startEdge)));
  }

  // 7. UPLOAD PATH
  // Readiness check composing Storage status and the upload_analyze config pointer
  if (isStorageUp && typeof edgeApi.uploadAnalyze === 'function') {
      checks.push(createCheck('upload_path', 'SERVICES', 'Upload Path', 'ok', 'Storage & Client OK'));
  } else {
      checks.push(createCheck('upload_path', 'SERVICES', 'Upload Path', 'warn', 'Dependencies missing'));
  }

  // ============================================
  // C. TUTOR FLOW
  // ============================================

  // 8. OCR / ANALYZE
  // Structural Readiness Check
  if (typeof edgeApi.uploadAnalyze === 'function') {
      checks.push(createCheck('ocr_analyze', 'TUTOR FLOW', 'OCR / Analyze', 'ok', 'Client binding active'));
  } else {
      checks.push(createCheck('ocr_analyze', 'TUTOR FLOW', 'OCR / Analyze', 'fail', 'Binding not found'));
  }

  // 9. MISSION ENGINE
  // Structural Readiness Check
  if (typeof edgeApi.missionSync === 'function') {
      checks.push(createCheck('mission_engine', 'TUTOR FLOW', 'Mission Engine', 'ok', 'Client binding active'));
  } else {
      checks.push(createCheck('mission_engine', 'TUTOR FLOW', 'Mission Engine', 'fail', 'Binding not found'));
  }

  // 10. TUTOR START CONTRACT
  // Structural Readiness Check asserting the core tab/tutor bridges exist
  if (typeof edgeApi.sessionStart === 'function' && typeof edgeApi.exerciseNext === 'function') {
      checks.push(createCheck('tutor_start', 'TUTOR FLOW', 'Tutor Start Contract', 'ok', 'Tablero->Tutor valid'));
  } else {
      checks.push(createCheck('tutor_start', 'TUTOR FLOW', 'Tutor Start Contract', 'fail', 'Contract broken'));
  }

  return checks;
}
