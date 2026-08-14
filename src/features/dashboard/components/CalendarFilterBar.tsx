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
    badgeStyle: string;
  }[] = [
    {
      id: 'all',
      label: 'All Events',
      icon: Layers,
      count: counts.all,
      badgeStyle: 'bg-surface-muted text-text-primary border border-border',
    },
    {
      id: 'sessions',
      label: 'Shoots & Calls',
      icon: Camera,
      count: counts.sessions,
      badgeStyle: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
    },
    {
      id: 'deadlines',
      label: 'Deliverables',
      icon: FileBox,
      count: counts.deadlines,
      badgeStyle: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    },
    {
      id: 'payments',
      label: 'Payment Schedules',
      icon: Receipt,
      count: counts.payments,
      badgeStyle: 'bg-amber-50 text-amber-800 border border-amber-200',
    },
  ];

  return (
    <div data-testid="calendar-filter-bar" className="flex flex-wrap items-center gap-2">
      {filters.map((f) => {
        const Icon = f.icon;
        const isActive = currentFilter === f.id;
        return (
          <button
            key={f.id}
            type="button"
            data-testid={`filter-${f.id}`}
            onClick={() => onFilterChange(f.id)}
            className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'border border-border bg-surface text-text-secondary hover:bg-surface-muted hover:text-text-primary'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{f.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                isActive ? 'bg-primary-foreground/20 text-primary-foreground' : f.badgeStyle
              }`}
            >
              {f.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
