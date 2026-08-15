import React from 'react';
import { useNavigate } from 'react-router';
import { Camera, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { SessionTypeBadge } from '@/features/sessions';
import type { Session } from '@/features/sessions';

interface UpcomingSessionsCardProps {
  sessions: (Session & { project?: { title?: string } })[];
  isLoading?: boolean;
}

export const UpcomingSessionsCard: React.FC<UpcomingSessionsCardProps> = ({
  sessions,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="h-44 animate-pulse rounded-2xl border border-border/60 bg-surface-muted/40" />
    );
  }

  const formatDateParts = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return {
        month: date.toLocaleDateString(undefined, { month: 'short' }),
        day: date.toLocaleDateString(undefined, { day: 'numeric' }),
        weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
      };
    } catch {
      return { month: '', day: dateStr, weekday: '' };
    }
  };

  return (
    <div
      data-testid="upcoming-sessions-panel"
      className="rounded-2xl border border-border/80 bg-surface p-5 shadow-2xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-status-info border border-sky-500/20">
            <Camera className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-tight">
              Upcoming Shoots
            </h3>
            <p className="text-xs text-text-secondary">{sessions.length} on horizon</p>
          </div>
        </div>

        <button
          type="button"
          data-testid="view-calendar-btn"
          onClick={() => navigate('/calendar')}
          className="text-xs font-semibold text-primary hover:text-primary/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1 transition-colors"
        >
          Calendar →
        </button>
      </div>

      {/* Empty State */}
      {sessions.length === 0 && (
        <div
          data-testid="upcoming-sessions-empty-state"
          className="mt-4 flex items-center gap-3 rounded-xl bg-surface-muted/30 border border-border-subtle p-3.5"
        >
          <Calendar className="h-5 w-5 text-text-muted shrink-0" />
          <div className="min-w-0 flex-1 text-xs">
            <span className="font-semibold text-text-primary">No upcoming sessions</span>
            <p className="text-text-secondary mt-0.5">
              Sessions will appear here once scheduled inside projects.
            </p>
          </div>
        </div>
      )}

      {/* Sessions List — Refined interactive session rows */}
      {sessions.length > 0 && (
        <div data-testid="upcoming-sessions-list" className="mt-4 divide-y divide-border-subtle/80">
          {sessions.slice(0, 5).map((s) => {
            const { month, day, weekday } = formatDateParts(s.date);
            return (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                data-testid={`upcoming-session-item-${s.id}`}
                onClick={() => navigate(`/projects/${s.project_id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/projects/${s.project_id}`);
                  }
                }}
                className="group flex items-center justify-between gap-3 py-3 transition-colors hover:bg-surface-muted/40 -mx-2 px-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Mini Calendar Tile */}
                  <div className="flex flex-col items-center justify-center h-11 w-11 shrink-0 rounded-xl bg-surface-muted/80 border border-border/60 text-center">
                    <span className="text-[9px] font-bold text-primary uppercase leading-tight">
                      {month || weekday}
                    </span>
                    <span className="text-sm font-bold text-text-primary tabular-nums leading-tight">
                      {day}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-text-primary truncate">
                        {s.title}
                      </span>
                      <SessionTypeBadge type={s.type} customLabel={s.custom_type_label} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-text-secondary">
                      {s.project?.title && (
                        <span className="truncate max-w-[130px] font-medium text-text-primary">
                          {s.project.title}
                        </span>
                      )}
                      {s.start_time && (
                        <span className="inline-flex items-center gap-1 font-semibold text-primary">
                          <Clock className="h-3 w-3" />
                          {s.start_time.slice(0, 5)}
                        </span>
                      )}
                      {s.location && (
                        <span className="inline-flex items-center gap-1 text-text-secondary truncate max-w-[120px]">
                          <MapPin className="h-3 w-3 text-text-muted shrink-0" />
                          {s.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
