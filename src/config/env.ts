/**
 * Reads environment variables that Vite exposes to the browser.
 * Only variables starting with VITE_ are visible in the browser.
 * Put secrets (service_role keys, API tokens) on a server, never here.
 */

export type DataSourceMode = 'synthetic' | 'supabase';

function readEnvironmentValue(value: string | undefined): string {
  return (value ?? '').trim();
}

const requestedMode = readEnvironmentValue(import.meta.env.VITE_DATA_SOURCE);

/** 'synthetic' unless VITE_DATA_SOURCE is exactly 'supabase'. */
export const DATA_SOURCE_MODE: DataSourceMode =
  requestedMode === 'supabase' ? 'supabase' : 'synthetic';

export const SUPABASE_URL = readEnvironmentValue(import.meta.env.VITE_SUPABASE_URL);
export const SUPABASE_ANON_KEY = readEnvironmentValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

/** True while the app shows generated demo data. */
export const IS_DEMO_MODE = DATA_SOURCE_MODE === 'synthetic';

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
