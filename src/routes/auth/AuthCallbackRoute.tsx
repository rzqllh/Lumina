import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/lib/auth';

export function AuthCallbackRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refetchWorkspace } = useWorkspace();

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error || !data.session) {
          navigate('/login?error=auth_failed', { replace: true });
          return;
        }

        // Trigger workspace bootstrap query immediately
        await refetchWorkspace();

        const rawReturnTo = searchParams.get('returnTo');
        const safeDestination =
          rawReturnTo && rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//')
            ? rawReturnTo
            : '/';

        navigate(safeDestination, { replace: true });
      } catch {
        if (isMounted) {
          navigate('/login?error=auth_failed', { replace: true });
        }
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, searchParams, refetchWorkspace]);

  return (
    <main
      data-testid="auth-callback-loading"
      className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          aria-label="Signing in"
          className="h-10 w-10 animate-spin rounded-full border-3 border-border border-t-primary"
        />
        <p className="text-sm font-medium text-text-muted">Completing sign-in...</p>
      </div>
    </main>
  );
}
