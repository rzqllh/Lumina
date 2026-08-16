import React from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { formatMoney } from '@/lib/money';
import type { CalendarEvent } from '../types';

interface CalendarAgendaViewProps {
  events: CalendarEvent[];
  currency?: string;
}

export const CalendarAgendaView: React.FC<CalendarAgendaViewProps> = ({
  events,
  currency = 'IDR',
}) => {
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];

  const getEventBadge = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'session':
        return {
          label: 'Shoot / Session',
          style: 'bg-primary-subtle text-primary-text border-primary-border',
        };
      case 'deliverable':
        return {
          label: 'Deliverable',
          style: 'bg-status-success-subtle text-status-success-text border-status-success-border',
        };
      case 'revision':
        return {
          label: 'Revision Due',
          style: 'bg-status-danger-subtle text-status-danger-text border-status-danger-border',
        };
      case 'payment':
      default:
        return {
          label: 'Payment Due',
          style: 'bg-status-warning-subtle text-status-warning-text border-status-warning-border',
        };
    }
  };

  // Group events by Date
  const groupedEvents = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});

  const dates = Object.keys(groupedEvents).sort();

  const formatHeadingDate = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div data-testid="calendar-agenda-view" className="space-y-6">
      {dates.length === 0 ? (
        <div
          data-testid="calendar-agenda-empty"
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-12 text-center"
        >
          <Calendar className="h-10 w-10 text-text-secondary mb-2" />
          <h4 className="text-sm font-bold text-text-primary">No events in this category</h4>
          <p className="mt-1 max-w-sm text-xs text-text-secondary">
            There are no scheduled shoots, delivery deadlines, or payment milestones matching your
            active filter.
          </p>
        </div>
      ) : (
        dates.map((dateStr) => {
          const dayEvents = groupedEvents[dateStr];
          const isToday = dateStr === todayStr;

          return (
            <div key={dateStr} className="space-y-2.5">
              {/* Date Header */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isToday ? 'text-primary' : 'text-text-secondary'
                  }`}
                >
                  {formatHeadingDate(dateStr)}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Date Events */}
              <div className="space-y-2">
                {dayEvents.map((event) => {
                  const badge = getEventBadge(event.type);
                  return (
                    <div
                      key={event.id}
                      role="button"
                      tabIndex={0}
                      data-testid={`agenda-event-${event.id}`}
                      onClick={() => navigate(`/projects/${event.projectId}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/projects/${event.projectId}`);
                        }
                      }}
                      className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-2xs hover:border-primary/40 hover:bg-surface-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all cursor-pointer"
                    >
                      {/* Left Info */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${badge.style}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-xs font-bold text-text-primary truncate">
                            {event.title}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                          <span className="font-semibold text-text-primary">
                            {event.projectTitle}
                          </span>
                          {event.time && (
                            <span className="flex items-center gap-1 text-primary font-semibold">
                              <Clock className="h-3.5 w-3.5" />
                              {event.time}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1 text-text-secondary truncate max-w-xs">
                              <MapPin className="h-3.5 w-3.5 text-text-muted" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Amount & Navigation */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-center">
                        {event.amount !== undefined && (
                          <span className="text-sm font-bold text-text-primary">
                            {formatMoney(event.amount, currency)}
                          </span>
                        )}
                        <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
