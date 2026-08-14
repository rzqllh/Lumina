import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router';
import { useAuth, useWorkspace } from '@/lib/auth';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status: authStatus } = useAuth();
  const { isLoading: isWorkspaceLoading, error: workspaceError, refetchWorkspace } = useWorkspace();
  const location = useLocation();

  // 1. Authenticated but workspace bootstrap failed
  if (workspaceError) {
    return (
      <div
        data-testid="workspace-error-state"
        className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4"
      >
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xs">
          <div className="flex items-center gap-2 text-status-danger">
            <span className="h-2.5 w-2.5 rounded-full bg-status-danger" />
            <h2 className="text-base font-semibold text-text-primary">Workspace Setup Error</h2>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {workspaceError.message || 'Unable to connect to your personal workspace.'}
          </p>
          <button
            type="button"
            onClick={() => refetchWorkspace()}
            className="mt-5 w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.99]"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // 2. Initializing session or bootstrapping workspace
  if (authStatus === 'initializing' || (authStatus === 'authenticated' && isWorkspaceLoading)) {
    return (
      <div
        data-testid="auth-initializing-state"
        className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4"
      >
        <div className="flex flex-col items-center gap-3">
          <div
            aria-label="Loading Lumina"
            className="h-10 w-10 animate-spin rounded-full border-3 border-border border-t-primary"
          />
          <p className="text-sm font-medium text-text-muted">Loading Lumina...</p>
        </div>
      </div>
    );
  }

  // 3. Unauthenticated -> Redirect to /login with returnTo
  if (authStatus === 'unauthenticated' || authStatus === 'error') {
    const returnTo = location.pathname + location.search;
    const loginUrl =
      returnTo && returnTo !== '/' && returnTo !== '/login'
        ? `/login?returnTo=${encodeURIComponent(returnTo)}`
        : '/login';

    return <Navigate to={loginUrl} replace />;
  }

  // 4. Authenticated + Workspace Ready
  return children ? <>{children}</> : <Outlet />;
}
