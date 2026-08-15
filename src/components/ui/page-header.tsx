import React from 'react';
import { cn } from '@/lib/utils';

/**
 * G-001 — Canonical Page Header
 * Used on Projects, Schedule, Clients, Settings.
 * Provides: title, optional description, optional contextual actions, optional metadata.
 * Mobile: stacked. Desktop: title left, actions right.
 */
export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  metadata?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  metadata,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-border-subtle pb-5',
        className
      )}
    >
      <div className="space-y-1 min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary leading-tight truncate">
          {title}
        </h1>
        {description && <p className="text-sm text-text-secondary">{description}</p>}
        {metadata && (
          <div className="flex items-center gap-2 text-xs text-text-muted pt-0.5">{metadata}</div>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">{actions}</div>
      )}
    </div>
  );
};
