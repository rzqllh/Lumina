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
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
            Production Calendar
          </h1>
          <p className="mt-0.5 text-xs text-text-muted">
            {currentWorkspace?.name || 'Production Schedule'} • Shoot call times, delivery
            deadlines, and payment schedules
          </p>
        </div>

        {/* View Mode Toggle & Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Navigation (For Month Grid View) */}
          <div className="flex items-center rounded-xl border border-border bg-surface shadow-2xs">
            <button
              type="button"
              data-testid="prev-month-btn"
              onClick={handlePrevMonth}
              title="Previous Month"
              aria-label="Previous month"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer rounded-l-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span
              data-testid="current-month-heading"
              className="px-3 text-xs font-bold text-text-primary select-none"
            >
              {monthFormatted}
            </span>
            <button
              type="button"
              data-testid="next-month-btn"
              onClick={handleNextMonth}
              title="Next Month"
              aria-label="Next month"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer rounded-r-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            data-testid="today-jump-btn"
            onClick={handleTodayJump}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Today
          </button>

          {/* View Toggle */}
          <div className="flex items-center rounded-xl border border-border bg-surface p-1 shadow-2xs">
            <button
              type="button"
              data-testid="view-month-btn"
              onClick={() => setViewMode('month')}
              className={`flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                viewMode === 'month'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Month</span>
            </button>
            <button
              type="button"
              data-testid="view-agenda-btn"
              onClick={() => setViewMode('agenda')}
              className={`flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                viewMode === 'agenda'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
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
          className="flex items-center justify-between rounded-xl border border-status-danger/25 bg-status-danger/8 p-4 text-xs text-status-danger"
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
            className="flex items-center gap-1 text-[11px] font-bold underline cursor-pointer"
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
          className="h-96 animate-pulse rounded-2xl border border-border bg-surface-muted/50"
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
