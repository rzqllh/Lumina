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
      <div className="h-40 animate-pulse rounded-[var(--radius-card)] border border-border bg-surface-muted/50" />
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      data-testid="upcoming-sessions-panel"
      className="rounded-[var(--radius-card)] border border-border bg-surface p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-status-info">
            <Camera className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Upcoming Shoots</h3>
            <p className="text-xs text-text-secondary">{sessions.length} on horizon</p>
          </div>
        </div>

        <button
          type="button"
          data-testid="view-calendar-btn"
          onClick={() => navigate('/calendar')}
          className="text-xs font-semibold text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
        >
          Calendar →
        </button>
      </div>

      {/* Empty State */}
      {sessions.length === 0 && (
        <div
          data-testid="upcoming-sessions-empty-state"
          className="mt-5 text-center py-4"
        >
          <Calendar className="h-7 w-7 text-text-muted mx-auto mb-2" />
          <p className="text-xs font-medium text-text-primary">No upcoming sessions</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            Sessions will appear here once scheduled inside projects.
          </p>
        </div>
      )}

      {/* Sessions List — divider rows */}
      {sessions.length > 0 && (
        <div data-testid="upcoming-sessions-list" className="mt-4 divide-y divide-border-subtle">
          {sessions.slice(0, 5).map((s) => (
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
              className="group flex items-center justify-between gap-3 py-3 transition-colors hover:bg-surface-muted/30 -mx-2 px-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-text-primary truncate">{s.title}</span>
                  <SessionTypeBadge type={s.type} customLabel={s.custom_type_label} />
                </div>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-text-secondary">
                  <span className="flex items-center gap-1 font-medium text-text-primary">
                    <Calendar className="h-3 w-3 text-text-muted" />
                    {formatDate(s.date)}
                  </span>
                  {s.start_time && (
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <Clock className="h-3 w-3" />
                      {s.start_time.slice(0, 5)}
                    </span>
                  )}
                  {s.location && (
                    <span className="flex items-center gap-1 text-text-secondary truncate max-w-[130px]">
                      <MapPin className="h-3 w-3 text-text-muted" />
                      {s.location}
                    </span>
                  )}
                </div>
              </div>

              <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-primary transition-colors shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
