import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from '../config/env';

let sharedClient: SupabaseClient | null = null;

/** Returns one shared Supabase client, or null if the environment variables are missing. */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (sharedClient === null) {
    sharedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return sharedClient;
}
