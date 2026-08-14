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
      label: 'All Production Events',
      icon: Layers,
      count: counts.all,
      badgeStyle: 'bg-surface-muted text-text-secondary',
    },
    {
      id: 'sessions',
      label: 'Shoots & Calls',
      icon: Camera,
      count: counts.sessions,
      badgeStyle: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    },
    {
      id: 'deadlines',
      label: 'Deliverables',
      icon: FileBox,
      count: counts.deadlines,
      badgeStyle: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    {
      id: 'payments',
      label: 'Payment Schedules',
      icon: Receipt,
      count: counts.payments,
      badgeStyle: 'bg-amber-50 text-amber-700 border border-amber-200',
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
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'border border-border bg-surface text-text-secondary hover:bg-surface-muted'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{f.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                isActive ? 'bg-white/20 text-white' : f.badgeStyle
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
