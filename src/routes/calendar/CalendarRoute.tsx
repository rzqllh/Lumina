import { useState } from 'react';
import { useWorkspace } from '@/lib/auth';
import {
  useCalendarEvents,
  CalendarFilterBar,
  CalendarMonthView,
  CalendarAgendaView,
} from '@/features/dashboard';
import { ChevronLeft, ChevronRight, List, Grid, AlertCircle, RefreshCw } from 'lucide-react';
import type { CalendarCategoryFilter } from '@/features/dashboard/types';

export function CalendarRoute() {
  const { workspaceId, currentWorkspace } = useWorkspace();
  const wsId = workspaceId ?? '';

  const { data: events = [], isLoading, error, refetch } = useCalendarEvents(wsId);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [categoryFilter, setCategoryFilter] = useState<CalendarCategoryFilter>('all');

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleTodayJump = () => {
    setCurrentDate(new Date());
  };

  const monthFormatted = currentDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (categoryFilter === 'sessions') return e.type === 'session';
    if (categoryFilter === 'deadlines') return e.type === 'deliverable' || e.type === 'revision';
    if (categoryFilter === 'payments') return e.type === 'payment';
    return true;
  });

  const counts = {
    all: events.length,
    sessions: events.filter((e) => e.type === 'session').length,
    deadlines: events.filter((e) => e.type === 'deliverable' || e.type === 'revision').length,
    payments: events.filter((e) => e.type === 'payment').length,
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            Schedule
          </h1>
          <p className="mt-0.5 text-xs text-text-secondary">
            {currentWorkspace?.name || 'Production schedule'}
          </p>
        </div>

        {/* Navigation & View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Navigation */}
          <div className="flex items-center rounded-[var(--radius-input)] border border-border bg-surface">
            <button
              type="button"
              data-testid="prev-month-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="flex min-h-[40px] min-w-[40px] items-center justify-center text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer rounded-l-[var(--radius-input)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span
              data-testid="current-month-heading"
              className="px-3 text-xs font-semibold text-text-primary select-none"
            >
              {monthFormatted}
            </span>
            <button
              type="button"
              data-testid="next-month-btn"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="flex min-h-[40px] min-w-[40px] items-center justify-center text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer rounded-r-[var(--radius-input)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            data-testid="today-jump-btn"
            onClick={handleTodayJump}
            className="inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-[var(--radius-input)] border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Today
          </button>

          {/* View Toggle — muted active, not filled purple */}
          <div className="flex items-center rounded-[var(--radius-input)] border border-border bg-surface p-0.5">
            <button
              type="button"
              data-testid="view-month-btn"
              onClick={() => setViewMode('month')}
              className={[
                'flex min-h-[34px] items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                viewMode === 'month'
                  ? 'bg-surface-muted text-text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Month</span>
            </button>
            <button
              type="button"
              data-testid="view-agenda-btn"
              onClick={() => setViewMode('agenda')}
              className={[
                'flex min-h-[34px] items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                viewMode === 'agenda'
                  ? 'bg-surface-muted text-text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              <List className="h-3.5 w-3.5" />
              <span>Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <CalendarFilterBar
        currentFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        counts={counts}
      />

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          data-testid="calendar-error"
          className="flex items-center justify-between rounded-[var(--radius-card)] border border-status-danger/25 bg-status-danger/5 p-4 text-xs text-status-danger"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="font-medium">
              {error instanceof Error ? error.message : 'Failed to load calendar events'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1 text-[11px] font-semibold underline cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div
          data-testid="calendar-loading"
          className="h-96 animate-pulse rounded-[var(--radius-card)] border border-border bg-surface-muted/50"
        />
      )}

      {/* Main View */}
      {!isLoading && !error && (
        <>
          {viewMode === 'month' ? (
            <CalendarMonthView currentDate={currentDate} events={filteredEvents} />
          ) : (
            <CalendarAgendaView events={filteredEvents} />
          )}
        </>
      )}
    </div>
  );
}
