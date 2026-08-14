import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Browser-safe Supabase client configured with public publishable credentials only
export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
