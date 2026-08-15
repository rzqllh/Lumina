import { useState } from 'react';
import { useWorkspace } from '@/lib/auth';
import {
  useCalendarEvents,
  CalendarFilterBar,
  CalendarMonthView,
  CalendarAgendaView,
} from '@/features/dashboard';
import { ChevronLeft, ChevronRight, Grid, List, AlertCircle, RefreshCw } from 'lucide-react';
import { FilterSegmentedControl } from '@/components/ui/filter-segmented-control';
import type { CalendarCategoryFilter } from '@/features/dashboard/types';

/**
 * CAL-001 — Page header: month nav (prev/next/today) + view toggle
 * CAL-002 — Month/Agenda canonical toggle (FilterSegmentedControl pill variant)
 * CAL-003 — CalendarFilterBar already uses canonical chips
 */
export function CalendarRoute() {
  const { workspaceId } = useWorkspace();
  const wsId = workspaceId ?? '';

  const { data: events = [], isLoading, error, refetch } = useCalendarEvents(wsId);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [categoryFilter, setCategoryFilter] = useState<CalendarCategoryFilter>('all');

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const handleNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleTodayJump = () => setCurrentDate(new Date());

  const monthFormatted = currentDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

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

  const viewOptions = [
    { id: 'month', label: 'Month', icon: Grid, testId: 'view-month-btn' },
    { id: 'agenda', label: 'Agenda', icon: List, testId: 'view-agenda-btn' },
  ];

  return (
    <div className="space-y-5">
      {/* CAL-001 — Header: title + month nav + view toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary leading-tight">
            Schedule
          </h1>
          <p className="mt-0.5 text-sm text-text-secondary">{monthFormatted}</p>
        </div>

        {/* Controls: month nav + today + CAL-002 view toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month navigation */}
          <div
            className="flex items-center rounded-lg border border-border bg-surface overflow-hidden"
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <button
              type="button"
              data-testid="prev-month-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="flex items-center justify-center text-text-secondary hover:bg-surface-muted hover:text-text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              style={{
                width: 'var(--control-height-compact)',
                height: 'var(--control-height-compact)',
                transition: `background-color var(--duration-fast)`,
              }}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <span
              data-testid="current-month-heading"
              className="px-3 text-xs font-semibold text-text-primary select-none whitespace-nowrap"
            >
              {monthFormatted}
            </span>
            <button
              type="button"
              data-testid="next-month-btn"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="flex items-center justify-center text-text-secondary hover:bg-surface-muted hover:text-text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              style={{
                width: 'var(--control-height-compact)',
                height: 'var(--control-height-compact)',
                transition: `background-color var(--duration-fast)`,
              }}
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          {/* Today jump */}
          <button
            type="button"
            data-testid="today-jump-btn"
            onClick={handleTodayJump}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-3.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              height: 'var(--control-height-compact)',
              borderRadius: 'var(--radius-md)',
              transition: `background-color var(--duration-fast)`,
            }}
          >
            Today
          </button>

          {/* CAL-002 — View toggle: canonical pill */}
          <FilterSegmentedControl
            options={viewOptions}
            value={viewMode}
            onChange={(id) => setViewMode(id as 'month' | 'agenda')}
            variant="pill"
            testIdPrefix="view"
          />
        </div>
      </div>

      {/* CAL-003 — Category filter bar */}
      <CalendarFilterBar
        currentFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        counts={counts}
      />

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          data-testid="calendar-error"
          className="flex items-center justify-between rounded-xl border p-4 text-xs bg-status-danger-subtle text-status-danger-text border-status-danger-border"
          style={{ borderRadius: 'var(--radius-xl)' }}
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <p className="font-medium">
              {error instanceof Error ? error.message : 'Failed to load calendar events'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1 text-[11px] font-bold underline cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" strokeWidth={2} />
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div
          data-testid="calendar-loading"
          className="h-96 animate-pulse rounded-xl border border-border bg-surface-muted/50"
          style={{ borderRadius: 'var(--radius-xl)' }}
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
