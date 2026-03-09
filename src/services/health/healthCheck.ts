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

  // 1 & 2. BUILD and build.txt CHECKS
  const startBuildTxt = performance.now();
  try {
    const buildResp = await fetch('/build.txt');
    const latencyBuildTxt = Math.round(performance.now() - startBuildTxt);
    
    if (buildResp.ok) {
        const text = await buildResp.text();
        checks.push(createCheck('buildtxt', 'build.txt', 'ok', '200 OK', latencyBuildTxt));
        
        // Parse BUILD_ID=xxxxx
        const match = text.match(/BUILD_ID=([^\r\n]+)/);
        if (match && match[1]) {
            checks.push(createCheck('build', 'BUILD', 'ok', match[1]));
        } else {
            checks.push(createCheck('build', 'BUILD', 'warn', 'Missing BUILD_ID in file'));
        }
    } else {
        checks.push(createCheck('buildtxt', 'build.txt', 'fail', `Failed with status ${buildResp.status}`, latencyBuildTxt));
        checks.push(createCheck('build', 'BUILD', 'fail', 'Could not fetch /build.txt'));
    }
  } catch (error: any) {
    const latencyBuildTxt = Math.round(performance.now() - startBuildTxt);
    checks.push(createCheck('buildtxt', 'build.txt', 'fail', error.message, latencyBuildTxt));
    checks.push(createCheck('build', 'BUILD', 'fail', error.message));
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
