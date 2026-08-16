import React from 'react';
import { cn } from '@/lib/utils';

/**
 * G-007 — EmptyState
 * Two variants:
 * - 'section': compact inline empty state (within a card module)
 * - 'page': page-level empty state (standalone)
 * Avoids oversized empty containers.
 */

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'section' | 'page';
  testId?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  variant = 'section',
  testId,
  className,
}) => {
  if (variant === 'page') {
    return (
      <div
        data-testid={testId}
        className={cn(
          'flex min-h-[32vh] flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 sm:p-12 text-center shadow-subtle',
          className
        )}
      >
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-subtle text-primary mb-3.5 border border-primary-border/60 shadow-xs">
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </div>
        )}
        <h3 className="text-base font-semibold text-text-primary tracking-tight">{title}</h3>
        {description && (
          <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-text-secondary">
            {description}
          </p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    );
  }

  /* Section variant — compact inline */
  return (
    <div
      data-testid={testId}
      className={cn(
        'flex items-center gap-3 rounded-xl bg-surface-muted/60 border border-border-subtle p-4',
        className
      )}
    >
      {Icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-text-muted shrink-0 border border-border-subtle shadow-xs">
          <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
        </div>
      )}
      <div className="min-w-0 flex-1 text-xs">
        <span className="font-semibold text-text-primary block">{title}</span>
        {description && <p className="text-text-secondary mt-0.5 text-xs">{description}</p>}
        {action && <div className="mt-2.5">{action}</div>}
      </div>
    </div>
  );
};
