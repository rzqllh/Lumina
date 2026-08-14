import React from 'react';
import { useNavigate } from 'react-router';
import { X, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { formatMoney } from '@/lib/money';
import type { CalendarEvent } from '../types';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  events: CalendarEvent[];
  currency?: string;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  events,
  currency = 'IDR',
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const formattedDate = (() => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  })();

  const getEventBadge = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'session':
        return {
          label: 'Shoot / Session',
          style: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
      case 'deliverable':
        return { label: 'Deliverable', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'revision':
        return { label: 'Revision Due', style: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'payment':
      default:
        return { label: 'Payment Due', style: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h2 id="day-detail-title" className="text-sm font-bold text-text-primary">
                {formattedDate}
              </h2>
              <p className="text-xs text-text-secondary">
                {events.length} {events.length === 1 ? 'event' : 'events'} scheduled
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-secondary">
              No production events or deadlines on this day.
            </div>
          ) : (
            events.map((event) => {
              const badge = getEventBadge(event.type);
              return (
                <div
                  key={event.id}
                  role="button"
                  tabIndex={0}
                  data-testid={`modal-event-${event.id}`}
                  onClick={() => {
                    onClose();
                    navigate(`/projects/${event.projectId}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onClose();
                      navigate(`/projects/${event.projectId}`);
                    }
                  }}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-3.5 shadow-2xs hover:border-primary/40 hover:bg-surface-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${badge.style}`}
                    >
                      {badge.label}
                    </span>
                    {event.amount !== undefined && (
                      <span className="text-xs font-bold text-text-primary">
                        {formatMoney(event.amount, currency)}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-xs text-text-secondary font-medium">{event.projectTitle}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border-subtle pt-2 text-xs text-text-secondary">
                    <div className="flex items-center gap-3">
                      {event.time && (
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          <Clock className="h-3.5 w-3.5" />
                          {event.time}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1 text-text-secondary truncate max-w-[130px]">
                          <MapPin className="h-3.5 w-3.5 text-text-muted" />
                          {event.location}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
