import React from 'react';
import { useParams } from 'react-router';
import { useAuth, useWorkspace } from '@/lib/auth';

interface PlaceholderRouteProps {
  title: string;
  description: string;
  isPublic?: boolean;
}

export const PlaceholderRoute: React.FC<PlaceholderRouteProps> = ({
  title,
  description,
  isPublic = false,
}) => {
  const params = useParams();
  const { signOut, user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const isSettings = title.toLowerCase().includes('settings');

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-border bg-surface p-6 text-center shadow-xs">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-secondary">
        {isPublic ? 'Public Portal' : 'Workspace View'}
      </div>
      <h1 className="mb-1 text-xl font-bold tracking-tight text-text-primary">{title}</h1>
      <p className="mb-4 max-w-sm text-xs text-text-muted">{description}</p>

      {params.token && (
        <div className="rounded-lg border border-border-subtle bg-surface-muted px-3 py-1.5 font-mono text-xs text-accent">
          Token: {params.token}
        </div>
      )}

      {isSettings && (
        <div className="mt-4 flex w-full max-w-sm flex-col gap-3 rounded-xl border border-border bg-background p-4 text-left">
          <div className="text-xs">
            <span className="font-medium text-text-muted">Active Workspace: </span>
            <span className="font-semibold text-text-primary">
              {currentWorkspace?.name || 'Loading...'}
            </span>
          </div>
          <div className="text-xs">
            <span className="font-medium text-text-muted">Account: </span>
            <span className="font-mono text-text-secondary">
              {user?.email || 'Authenticated User'}
            </span>
          </div>
          <button
            type="button"
            data-testid="settings-signout-button"
            onClick={() => signOut()}
            className="mt-2 w-full cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-status-danger transition-colors hover:bg-status-danger/10 hover:border-status-danger/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sign Out of Lumina
          </button>
        </div>
      )}
    </div>
  );
};
