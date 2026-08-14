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
      <div className="h-44 animate-pulse rounded-2xl border border-border bg-surface-muted/50" />
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
      className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Camera className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Upcoming Shoots</h3>
            <p className="text-[11px] text-text-muted">{sessions.length} scheduled on horizon</p>
          </div>
        </div>

        <button
          type="button"
          data-testid="view-calendar-btn"
          onClick={() => navigate('/calendar')}
          className="text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          Calendar →
        </button>
      </div>

      {/* Empty State */}
      {sessions.length === 0 && (
        <div
          data-testid="upcoming-sessions-empty-state"
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/30 p-6 text-center"
        >
          <Calendar className="h-8 w-8 text-text-muted mb-1.5" />
          <h4 className="text-xs font-bold text-text-primary">No upcoming sessions</h4>
          <p className="mt-0.5 max-w-xs text-[11px] text-text-muted">
            Sessions and shoot dates will appear here once scheduled inside projects.
          </p>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length > 0 && (
        <div data-testid="upcoming-sessions-list" className="space-y-2.5">
          {sessions.slice(0, 5).map((s) => (
            <div
              key={s.id}
              data-testid={`upcoming-session-item-${s.id}`}
              onClick={() => navigate(`/projects/${s.project_id}`)}
              className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 transition-all hover:border-border-subtle hover:bg-surface-muted/30 cursor-pointer"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-text-primary truncate">{s.title}</span>
                  <SessionTypeBadge type={s.type} customLabel={s.custom_type_label} />
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-text-muted">
                  <span className="flex items-center gap-1 font-semibold text-text-secondary">
                    <Calendar className="h-3 w-3" />
                    {formatDate(s.date)}
                  </span>
                  {s.start_time && (
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <Clock className="h-3 w-3" />
                      {s.start_time.slice(0, 5)}
                    </span>
                  )}
                  {s.location && (
                    <span className="flex items-center gap-1 text-text-muted truncate max-w-[130px]">
                      <MapPin className="h-3 w-3" />
                      {s.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center text-text-muted group-hover:text-primary transition-colors">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
