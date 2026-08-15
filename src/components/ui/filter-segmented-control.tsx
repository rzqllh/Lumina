import React from 'react';
import { cn } from '@/lib/utils';

/**
 * G-006 — FilterSegmentedControl
 * Unified filter/tab control used across:
 * - Project status filters (All / Active / Draft / Archived)
 * - Client filters (Active / All & Archived)
 * - Calendar view toggle (Month / Agenda)
 * - Calendar event-type filters
 * No new filtering semantics. Preserves all existing data contracts.
 */

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  testId?: string;
}

export interface FilterSegmentedControlProps {
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  /** 'pill' = floating pill group (tab bar), 'chips' = individual pill chips */
  variant?: 'pill' | 'chips';
  className?: string;
  testIdPrefix?: string;
}

export const FilterSegmentedControl: React.FC<FilterSegmentedControlProps> = ({
  options,
  value,
  onChange,
  variant = 'pill',
  className,
  testIdPrefix,
}) => {
  if (variant === 'chips') {
    /* Chip style — each option is its own independent pill */
    return (
      <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = value === opt.id;
          const testId = opt.testId || (testIdPrefix ? `${testIdPrefix}-${opt.id}` : undefined);
          return (
            <button
              key={opt.id}
              type="button"
              data-testid={testId}
              onClick={() => onChange(opt.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium cursor-pointer',
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-surface text-text-primary border-border font-semibold shadow-subtle'
                  : 'bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-surface-muted'
              )}
              style={{ minHeight: 'var(--control-height-compact)' }}
            >
              {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />}
              <span>{opt.label}</span>
              {opt.count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums',
                    isActive
                      ? 'bg-primary-subtle text-primary-text'
                      : 'bg-surface-muted text-text-muted'
                  )}
                >
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  /* Pill / segmented style — options in a single track */
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-lg border border-border bg-surface p-1 overflow-x-auto',
        className
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.id;
        const testId = opt.testId || (testIdPrefix ? `${testIdPrefix}-${opt.id}` : undefined);
        return (
          <button
            key={opt.id}
            type="button"
            data-testid={testId}
            onClick={() => onChange(opt.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'bg-surface-muted text-text-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            )}
            style={{ minHeight: 'var(--control-height-compact)' }}
          >
            {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums',
                  isActive
                    ? 'bg-primary-subtle text-primary-text'
                    : 'bg-surface-muted text-text-muted'
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
