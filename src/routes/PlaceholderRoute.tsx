import React from 'react';
import { useParams } from 'react-router';

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

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--surface-elevated)] text-[var(--text-secondary)] mb-3">
        {isPublic ? 'Public View' : 'Workspace View'}
      </div>
      <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)] mb-1">
        {title}
      </h1>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mb-4">{description}</p>
      {params.token && (
        <div className="font-mono text-xs text-[var(--accent)] bg-[var(--surface-muted)] px-3 py-1.5 rounded-md border border-[var(--border-subtle)]">
          Token: {params.token}
        </div>
      )}
    </div>
  );
};
