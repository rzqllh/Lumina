// Supabase Edge Function: Health Check Endpoint
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({
      status: 'healthy',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      runtime: 'Deno / Supabase Edge Runtime',
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
});
