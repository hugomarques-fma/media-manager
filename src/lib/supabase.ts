import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client - for client-side operations
 * This is a simple browser client without server-side cookies
 */
export function createBrowserSupabaseClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
