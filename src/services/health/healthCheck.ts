import { BUILD_ID } from '../../build';
import { supabase } from '../../servicios/edgeApi';
import { HealthCheckItem, HealthStatus } from '../../types/health';

function createCheck(
  id: string,
  label: string,
  status: HealthStatus,
  message: string,
  latencyMs?: number
): HealthCheckItem {
  return {
    id,
    label,
    status,
    message,
    latencyMs,
    checkedAt: new Date().toISOString(),
  };
}

export async function runHealthCheck(): Promise<HealthCheckItem[]> {
  const checks: HealthCheckItem[] = [];

  // 1. BUILD CHECK
  if (BUILD_ID) {
    checks.push(createCheck('build', 'BUILD', 'ok', BUILD_ID));
  } else {
    checks.push(createCheck('build', 'BUILD', 'warn', 'Not found'));
  }

  // 2. build.txt CHECK
  const startBuildTxt = performance.now();
  try {
    const buildResp = await fetch('/build.txt');
    const latencyBuildTxt = Math.round(performance.now() - startBuildTxt);
    if (buildResp.ok) {
        checks.push(createCheck('buildtxt', 'build.txt', 'ok', '200 OK', latencyBuildTxt));
    } else {
        checks.push(createCheck('buildtxt', 'build.txt', 'fail', `Failed with status ${buildResp.status}`, latencyBuildTxt));
    }
  } catch (error: any) {
    const latencyBuildTxt = Math.round(performance.now() - startBuildTxt);
    checks.push(createCheck('buildtxt', 'build.txt', 'fail', error.message, latencyBuildTxt));
  }

  // 3. SUPABASE CHECK
  const startSupa = performance.now();
  try {
    const { error } = await supabase.auth.getSession();
    const latencySupa = Math.round(performance.now() - startSupa);
    
    if (error) {
       checks.push(createCheck('supabase', 'Supabase', 'fail', error.message, latencySupa));
    } else {
        checks.push(createCheck('supabase', 'Supabase', 'ok', 'Connected', latencySupa));
    }
  } catch (error: any) {
       const latencySupa = Math.round(performance.now() - startSupa);
       checks.push(createCheck('supabase', 'Supabase', 'fail', error.message, latencySupa));
  }
  
  // 4. ENV CHECK
  const supabaseUrlRaw = (import.meta as any).env?.VITE_SUPABASE_URL;
  const anonKeyRaw = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrlRaw && anonKeyRaw) {
      checks.push(createCheck('env', 'Environment', 'ok', 'Keys present'));
  } else {
      checks.push(createCheck('env', 'Environment', 'warn', 'Keys missing'));
  }

  return checks;
}
