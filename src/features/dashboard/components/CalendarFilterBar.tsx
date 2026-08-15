import React from 'react';
import { Layers, Camera, FileBox, Receipt } from 'lucide-react';
import { FilterSegmentedControl } from '@/components/ui/filter-segmented-control';
import type { CalendarCategoryFilter } from '../types';

/**
 * CAL-003 — CalendarFilterBar
 * Uses canonical G-006 FilterSegmentedControl (chips variant).
 * Current filter types: All | Shoots | Deliverables | Payments — unchanged.
 * Improved density and count presentation via canonical component.
 */

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
  const options = [
    { id: 'all', label: 'All', icon: Layers, count: counts.all },
    { id: 'sessions', label: 'Shoots', icon: Camera, count: counts.sessions },
    { id: 'deadlines', label: 'Deliverables', icon: FileBox, count: counts.deadlines },
    { id: 'payments', label: 'Payments', icon: Receipt, count: counts.payments },
  ];

  return (
    <div data-testid="calendar-filter-bar">
      <FilterSegmentedControl
        options={options}
        value={currentFilter}
        onChange={(id) => onFilterChange(id as CalendarCategoryFilter)}
        variant="chips"
        testIdPrefix="filter"
      />
    </div>
  );
};
