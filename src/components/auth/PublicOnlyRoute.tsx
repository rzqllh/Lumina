import React from 'react';
import { Navigate, useSearchParams, Outlet } from 'react-router';
import { useAuth } from '@/lib/auth';

export interface PublicOnlyRouteProps {
  children?: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { status } = useAuth();
  const [searchParams] = useSearchParams();

  if (status === 'initializing') {
    return (
      <div
        data-testid="public-initializing-state"
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

  if (status === 'authenticated') {
    const rawReturnTo = searchParams.get('returnTo');
    const safeDestination =
      rawReturnTo && rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//')
        ? rawReturnTo
        : '/';

    return <Navigate to={safeDestination} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
