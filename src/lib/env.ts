import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

export const env = envSchema.parse({
  VITE_SUPABASE_URL:
    import.meta.env.VITE_SUPABASE_URL || 'https://veljyxvrsyptarfgunan.supabase.co',
  VITE_SUPABASE_ANON_KEY:
    import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kjl-IFlAxUpRB4F3Bxvt0g_vXiGqE1n',
});
