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
      {/* Calendar Grid Container */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-border bg-surface-muted/40 text-center text-xs font-bold text-text-muted py-2.5">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
          {calendarCells.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[85px] sm:min-h-[105px] bg-surface-muted/20 p-2"
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
                data-testid={`calendar-day-${dateStr}`}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2 transition-colors cursor-pointer hover:bg-surface-muted/50 ${
                  isToday ? 'bg-primary/5 font-bold' : 'bg-surface'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                        : 'text-text-secondary'
                    }`}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-bold text-text-muted">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event Chips */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => {
                    const getDotColor = () => {
                      switch (event.type) {
                        case 'session':
                          return 'bg-indigo-500 text-indigo-700 bg-indigo-50 border-indigo-200';
                        case 'deliverable':
                          return 'bg-emerald-500 text-emerald-700 bg-emerald-50 border-emerald-200';
                        case 'payment':
                          return 'bg-amber-500 text-amber-700 bg-amber-50 border-amber-200';
                        default:
                          return 'bg-purple-500 text-purple-700 bg-purple-50 border-purple-200';
                      }
                    };

                    return (
                      <div
                        key={event.id}
                        title={`${event.title} (${event.projectTitle})`}
                        className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium border ${getDotColor()}`}
                      >
                        {event.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-[9px] font-semibold text-text-muted pl-1">
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
