import React from 'react';
import { Layers, Camera, FileBox, Receipt } from 'lucide-react';
import type { CalendarCategoryFilter } from '../types';

interface CalendarFilterBarProps {
  currentFilter: CalendarCategoryFilter;
  onFilterChange: (filter: CalendarCategoryFilter) => void;
  counts: {
    all: number;
    sessions: number;
    deadlines: number;
    payments: number;
  };
}

export const CalendarFilterBar: React.FC<CalendarFilterBarProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  const filters: {
    id: CalendarCategoryFilter;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
  }[] = [
    { id: 'all', label: 'All', icon: Layers, count: counts.all },
    { id: 'sessions', label: 'Shoots', icon: Camera, count: counts.sessions },
    { id: 'deadlines', label: 'Deliverables', icon: FileBox, count: counts.deadlines },
    { id: 'payments', label: 'Payments', icon: Receipt, count: counts.payments },
  ];

  return (
    <div data-testid="calendar-filter-bar" className="flex flex-wrap items-center gap-1.5">
      {filters.map((f) => {
        const Icon = f.icon;
        const isActive = currentFilter === f.id;
        return (
          <button
            key={f.id}
            type="button"
            data-testid={`filter-${f.id}`}
            onClick={() => onFilterChange(f.id)}
            className={[
              'inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-[var(--radius-input)] px-3 py-1.5 text-xs font-medium transition-colors duration-[var(--transition-normal)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isActive
                ? 'bg-surface-muted text-text-primary font-semibold border border-border'
                : 'text-text-secondary hover:bg-surface-muted/60 hover:text-text-primary',
            ].join(' ')}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{f.label}</span>
            <span
              className={[
                'rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums',
                isActive ? 'bg-primary/10 text-primary' : 'bg-surface-muted text-text-muted',
              ].join(' ')}
            >
              {f.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
