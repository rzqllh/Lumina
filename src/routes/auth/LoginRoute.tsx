import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '@/lib/auth';

export function LoginRoute() {
  const { signInWithGoogle, error: authContextError } = useAuth();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const urlError = searchParams.get('error');
  const returnTo = searchParams.get('returnTo') || undefined;

  const displayError =
    localError ||
    (urlError === 'auth_failed'
      ? 'Authentication failed or was cancelled. Please try again.'
      : urlError
        ? decodeURIComponent(urlError)
        : authContextError?.message || null);

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setLocalError(null);
      const { error } = await signInWithGoogle(returnTo);
      if (error) {
        setLocalError(error.message || 'Failed to initialize Google sign-in.');
        setIsSubmitting(false);
      }
      // If no error, browser is redirecting to Google OAuth URL
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-7 shadow-xs sm:p-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-xs">
            <svg
              className="h-6 w-6 text-primary-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">Lumina</h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Manage your photography work in one place.
          </p>
        </div>

        {/* Error Notice */}
        {displayError && (
          <div
            role="alert"
            data-testid="login-error-alert"
            className="mt-6 rounded-lg border border-status-danger/25 bg-status-danger/8 p-3.5 text-xs text-status-danger"
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 font-bold">!</span>
              <p className="flex-1 font-medium">{displayError}</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            data-testid="google-signin-button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-surface-muted hover:border-border-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <div
                  aria-label="Connecting"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-text-muted border-t-primary"
                />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Security & Workspace Note */}
        <p className="mt-6 text-center text-xs text-text-muted">
          Single sign-on for your personal production workspace.
        </p>
      </div>
    </main>
  );
}
