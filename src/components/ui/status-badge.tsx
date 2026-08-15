import React from 'react';
import { cn } from '@/lib/utils';

/**
 * G-005 — StatusBadge
 * Unified canonical status indicator.
 * Requirements: text + semantic styling (never color-only), compact, consistent.
 * Uses canonical status tokens from OKLCH token contract.
 */

export type StatusVariant =
  | 'active'
  | 'draft'
  | 'closed'
  | 'force_closed'
  | 'archived'
  | 'danger'
  | 'warning'
  | 'success'
  | 'info'
  | 'planned'
  | 'neutral';

interface StatusBadgeProps {
  variant: StatusVariant;
  label: string;
  className?: string;
  'data-testid'?: string;
}

const variantClasses: Record<StatusVariant, string> = {
  // Project workflow states
  active: 'bg-status-success-subtle text-status-success-text border-status-success-border',
  draft: 'bg-status-warning-subtle text-status-warning-text border-status-warning-border',
  closed: 'bg-primary-subtle text-primary-text border-primary-border',
  force_closed: 'bg-status-danger-subtle text-status-danger-text border-status-danger-border',
  archived: 'bg-surface-muted text-text-secondary border-border-subtle',
  // Semantic functional states
  danger: 'bg-status-danger-subtle text-status-danger-text border-status-danger-border',
  warning: 'bg-status-warning-subtle text-status-warning-text border-status-warning-border',
  success: 'bg-status-success-subtle text-status-success-text border-status-success-border',
  info: 'bg-status-info-subtle text-status-info-text border-status-info-border',
  // UI states
  planned: 'bg-surface-muted text-text-muted border-border-subtle',
  neutral: 'bg-surface-muted text-text-secondary border-border-subtle',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  label,
  className,
  'data-testid': testId,
}) => {
  return (
    <span
      data-testid={testId}
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  );
};

/**
 * ProjectStatusBadge — convenience wrapper.
 * Accepts the same ProjectStatus string union from projectTypes.ts
 * without creating a duplicate type export.
 */
const projectStatusLabels: Record<string, string> = {
  active: 'Active',
  draft: 'Draft',
  closed: 'Closed',
  force_closed: 'Force Closed',
  archived: 'Archived',
};

export const ProjectStatusBadge: React.FC<{
  status: string;
  className?: string;
  'data-testid'?: string;
}> = ({ status, className, 'data-testid': testId }) => {
  const variant = (status in variantClasses ? status : 'neutral') as StatusVariant;
  return (
    <StatusBadge
      variant={variant}
      label={projectStatusLabels[status] ?? status}
      className={className}
      data-testid={testId || `project-status-${status}`}
    />
  );
};
