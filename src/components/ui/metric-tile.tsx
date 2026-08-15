import React from 'react';
import { cn } from '@/lib/utils';

/**
 * G-003 — MetricTile
 * Compact operational metric display for workspace snapshots.
 * Supports: label, value (string), optional icon, optional semantic accent color.
 * Requirements: tabular numerals, compact 2-column mobile layout.
 * Forbidden: fabricated trend/delta/sparkline.
 */
export interface MetricTileProps {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  /** One of the canonical status accent roles */
  accent?: 'primary' | 'danger' | 'warning' | 'success' | 'info';
  testId?: string;
  className?: string;
}

const accentClasses: Record<string, string> = {
  primary: 'bg-primary-subtle text-primary-text border-primary-border',
  danger: 'bg-status-danger-subtle text-status-danger-text border-status-danger-border',
  warning: 'bg-status-warning-subtle text-status-warning-text border-status-warning-border',
  success: 'bg-status-success-subtle text-status-success-text border-status-success-border',
  info: 'bg-status-info-subtle text-status-info-text border-status-info-border',
};

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  icon: Icon,
  accent = 'primary',
  testId,
  className,
}) => {
  return (
    <div
      className={cn(
        'group flex flex-col justify-between rounded-xl border border-border bg-surface p-3.5 sm:p-4',
        'transition-all',
        className
      )}
      style={{
        transition: `border-color var(--duration-fast) var(--ease-standard),
                     box-shadow var(--duration-fast) var(--ease-standard)`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider leading-none">
          {label}
        </span>
        {Icon && (
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md border',
              accentClasses[accent]
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
          </div>
        )}
      </div>
      <p
        data-testid={testId}
        className="mt-2.5 text-xl font-semibold tracking-tight text-text-primary tabular-nums"
      >
        {value}
      </p>
    </div>
  );
};
