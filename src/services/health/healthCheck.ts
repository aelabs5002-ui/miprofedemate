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

  // 1. Frontend status (Self-check that the code is running)
  checks.push(
    createCheck('frontend_status', 'Frontend Status', 'ok', 'Frontend is executing correctly.')
  );

  // 2. Build ID exposure check
  if (BUILD_ID) {
    checks.push(createCheck('build_id', 'Build ID', 'ok', `Current inline BUILD_ID: ${BUILD_ID}`));
  } else {
    checks.push(createCheck('build_id', 'Build ID', 'warn', 'BUILD_ID variable not found or empty.'));
  }

  // 3. fetch /build.txt Check
  const startBuildTxt = performance.now();
  try {
    const buildResp = await fetch('/build.txt');
    const latencyBuildTxt = Math.round(performance.now() - startBuildTxt);
    if (buildResp.ok) {
        const text = await buildResp.text();
        checks.push(
             createCheck('build_txt', 'Build TXT Endpoint', 'ok', `/build.txt responds 200 OK. Content starts with: ${text.substring(0, 20)}...`, latencyBuildTxt)
        );
    } else {
        checks.push(
            createCheck('build_txt', 'Build TXT Endpoint', 'warn', `/build.txt failed with status ${buildResp.status}`, latencyBuildTxt)
        );
    }
  } catch (error: any) {
    const latencyBuildTxt = Math.round(performance.now() - startBuildTxt);
    checks.push(
        createCheck('build_txt', 'Build TXT Endpoint', 'warn', `Failed to fetch /build.txt: ${error.message}`, latencyBuildTxt)
    );
  }

  // 4. Supabase Client Verification (Presence Check)
  const supabaseUrlRaw = (import.meta as any).env?.VITE_SUPABASE_URL;
  const anonKeyRaw = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrlRaw && anonKeyRaw) {
      checks.push(createCheck('supabase_config', 'Supabase Client Config', 'ok', 'Supabase URL and Anon Key are present.'));
  } else {
      checks.push(createCheck('supabase_config', 'Supabase Client Config', 'warn', 'Supabase config missing from env. Falling back to default or undefined.'));
  }


  // 5. Supabase Connection Check
  const startSupa = performance.now();
  try {
    const { error } = await supabase.auth.getSession();
    const latencySupa = Math.round(performance.now() - startSupa);
    
    if (error) {
       checks.push(createCheck('supabase_conn', 'Supabase Connection', 'fail', `Failed to get session: ${error.message}`, latencySupa));
    } else {
        checks.push(createCheck('supabase_conn', 'Supabase Connection', 'ok', 'Successfully verified session endpoint connectivity (read-only).', latencySupa));
    }
  } catch (error: any) {
       const latencySupa = Math.round(performance.now() - startSupa);
       checks.push(createCheck('supabase_conn', 'Supabase Connection', 'fail', `Exception thrown connecting to Supabase: ${error.message}`, latencySupa));
  }

  return checks;
}
