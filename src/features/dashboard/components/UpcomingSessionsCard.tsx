import React from 'react';
import { useNavigate } from 'react-router';
import { Camera, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { SessionTypeBadge } from '@/features/sessions';
import { EmptyState } from '@/components/ui/empty-state';
import type { Session } from '@/features/sessions';

/**
 * DASH-006 — UpcomingSessionsCard
 * Uses existing: date, time, type, project, location.
 * Compact empty state.
 */

interface UpcomingSessionsCardProps {
  sessions: (Session & { project?: { title?: string } })[];
  isLoading?: boolean;
}

export const UpcomingSessionsCard: React.FC<UpcomingSessionsCardProps> = ({
  sessions,
  isLoading = false,
}) => {
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div className="h-40 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
    );
  }

  return (
    <div data-testid="upcoming-sessions-panel" className="surface-level-2 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-status-info-subtle text-status-info-text border-status-info-border">
            <Camera className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary tracking-tight">
              Upcoming Shoots
            </h2>
            <p className="text-xs text-text-secondary">
              {sessions.length > 0 ? `${sessions.length} on horizon` : 'No scheduled sessions'}
            </p>
          </div>
        </div>

        <button
          type="button"
          data-testid="view-calendar-btn"
          onClick={() => navigate('/calendar')}
          className="text-xs font-semibold text-primary-text cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1"
          style={{ transition: `color var(--duration-fast)` }}
        >
          Calendar →
        </button>
      </div>

      {/* Empty state */}
      {sessions.length === 0 && (
        <div className="mt-4">
          <EmptyState
            icon={Calendar}
            title="No upcoming sessions"
            description="Sessions will appear here once scheduled inside projects."
            variant="section"
            testId="upcoming-sessions-empty-state"
          />
        </div>
      )}

      {/* Session list */}
      {sessions.length > 0 && (
        <div data-testid="upcoming-sessions-list" className="mt-4 divide-y divide-border-subtle">
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
                className="group flex items-center justify-between gap-3 py-3 -mx-2 px-2.5 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ transition: `background-color var(--duration-fast) var(--ease-standard)` }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--color-surface-muted)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Mini date tile */}
                  <div className="flex flex-col items-center justify-center h-10 w-10 shrink-0 rounded-lg border border-border-subtle bg-surface-muted text-center">
                    <span className="text-[9px] font-bold text-primary-text uppercase leading-tight">
                      {month || weekday}
                    </span>
                    <span className="text-sm font-bold text-text-primary tabular-nums leading-tight">
                      {day}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
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
                        <span className="inline-flex items-center gap-1 font-semibold text-primary-text">
                          <Clock className="h-3 w-3" strokeWidth={1.75} />
                          {s.start_time.slice(0, 5)}
                        </span>
                      )}
                      {s.location && (
                        <span className="inline-flex items-center gap-1 text-text-secondary truncate max-w-[120px]">
                          <MapPin className="h-3 w-3 text-text-muted shrink-0" strokeWidth={1.75} />
                          {s.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ArrowRight
                  className="h-3.5 w-3.5 text-text-muted shrink-0"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
