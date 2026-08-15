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
          'flex min-h-[30vh] flex-col items-center justify-center py-12 text-center',
          className
        )}
      >
        {Icon && <Icon className="h-8 w-8 text-text-muted mb-3" strokeWidth={1.5} />}
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {description && <p className="mt-1 max-w-xs text-xs text-text-secondary">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }

  /* Section variant — compact inline */
  return (
    <div
      data-testid={testId}
      className={cn(
        'flex items-center gap-3 rounded-lg bg-surface-muted/40 border border-border-subtle p-3.5',
        className
      )}
    >
      {Icon && <Icon className="h-5 w-5 text-text-muted shrink-0" strokeWidth={1.5} />}
      <div className="min-w-0 flex-1 text-xs">
        <span className="font-semibold text-text-primary">{title}</span>
        {description && <p className="text-text-secondary mt-0.5">{description}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
};
