import React, { useState } from 'react';
import { DayDetailModal } from './DayDetailModal';
import type { CalendarEvent } from '../types';

interface CalendarMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  currency?: string;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  currentDate,
  events,
  currency = 'IDR',
}) => {
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon ...
  const daysInMonth = lastDayOfMonth.getDate();

  const todayStr = new Date().toISOString().split('T')[0];

  // Group events by date string "YYYY-MM-DD"
  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calendar cells
  const calendarCells = [];

  // Empty preceding days
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push(null);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const selectedDayEvents = selectedDateStr ? eventsByDate[selectedDateStr] || [] : [];

  return (
    <div data-testid="calendar-month-view" className="space-y-4">
      {/* Calendar Grid Container — gap-px pattern for lighter dividers */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-border">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-px bg-border">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="bg-surface-muted py-2 text-center text-[11px] font-semibold text-text-secondary"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid — gap-px creates 1px lines from the bg-border parent */}
        <div className="grid grid-cols-7 gap-px bg-border">
          {calendarCells.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[80px] sm:min-h-[100px] bg-surface-muted/50 p-1.5"
                />
              );
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(
              2,
              '0'
            )}`;
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;

            return (
              <div
                key={dateStr}
                role="button"
                tabIndex={0}
                data-testid={`calendar-day-${dateStr}`}
                onClick={() => setSelectedDateStr(dateStr)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedDateStr(dateStr);
                  }
                }}
                className={[
                  'min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 transition-colors cursor-pointer',
                  'hover:bg-surface-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                  isToday ? 'bg-primary/[0.04]' : 'bg-surface',
                ].join(' ')}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={[
                      'flex h-6 w-6 items-center justify-center rounded-full text-[11px]',
                      isToday
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'text-text-primary font-medium',
                    ].join(' ')}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-semibold text-text-muted">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event Chips */}
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((event) => {
                    const chipColor = (() => {
                      switch (event.type) {
                        case 'session':
                          return 'text-primary-text bg-primary-subtle border border-primary-border';
                        case 'deliverable':
                          return 'text-status-success-text bg-status-success-subtle border border-status-success-border';
                        case 'payment':
                          return 'text-status-warning-text bg-status-warning-subtle border border-status-warning-border';
                        default:
                          return 'text-status-info-text bg-status-info-subtle border border-status-info-border';
                      }
                    })();

                    return (
                      <div
                        key={event.id}
                        title={`${event.title} (${event.projectTitle})`}
                        className={`truncate rounded px-1 py-px text-[10px] font-semibold ${chipColor}`}
                      >
                        {event.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] font-semibold text-text-muted pl-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDateStr && (
        <DayDetailModal
          isOpen={Boolean(selectedDateStr)}
          onClose={() => setSelectedDateStr(null)}
          dateStr={selectedDateStr}
          events={selectedDayEvents}
          currency={currency}
        />
      )}
    </div>
  );
};
