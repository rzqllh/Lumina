import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { SessionTypeBadge } from './SessionTypeBadge';
import { SessionStatusBadge } from './SessionStatusBadge';
import type { Session, SessionStatus } from '../types';

interface SessionCardProps {
  session: Session;
  isForceClosed?: boolean;
  onEdit: (session: Session) => void;
  onDelete: (sessionId: string) => void;
  onStatusChange: (sessionId: string, newStatus: SessionStatus) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  isForceClosed = false,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  // Format Date (e.g., "Sat, 15 Sep 2026" or "15 Sep 2026")
  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Format Time (e.g., "06:00" or "06:00 - 12:00")
  const formatTimeRange = (start?: string | null, end?: string | null) => {
    if (!start && !end) return null;
    const cleanStart = start ? start.slice(0, 5) : '';
    const cleanEnd = end ? end.slice(0, 5) : '';
    if (cleanStart && cleanEnd) return `${cleanStart} – ${cleanEnd}`;
    return cleanStart || cleanEnd;
  };

  const timeRange = formatTimeRange(session.start_time, session.end_time);

  return (
    <div
      data-testid={`session-card-${session.id}`}
      className={`group rounded-xl border border-border bg-surface p-4 shadow-2xs transition-all hover:border-border-subtle ${
        session.status === 'cancelled' ? 'opacity-75 bg-surface-muted/30' : ''
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Main Info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SessionTypeBadge type={session.type} customLabel={session.custom_type_label} />
            <SessionStatusBadge status={session.status} />
          </div>

          <h4 className="text-sm font-semibold text-text-primary truncate">{session.title}</h4>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5 font-medium text-text-primary">
              <Calendar className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
              {formatDate(session.date)}
            </span>

            {timeRange && (
              <span className="flex items-center gap-1.5 text-text-muted tabular-nums">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                {timeRange}
              </span>
            )}

            {session.location && (
              <span className="flex items-center gap-1.5 text-text-muted truncate max-w-xs">
                <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{session.location}</span>
              </span>
            )}
          </div>

          {session.notes && (
            <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-surface-muted/50 p-2.5 text-xs text-text-secondary border border-border-subtle/50">
              <FileText
                className="h-3.5 w-3.5 text-text-muted shrink-0 mt-0.5"
                strokeWidth={1.75}
              />
              <p className="whitespace-pre-wrap line-clamp-2">{session.notes}</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {!isForceClosed && (
          <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-1">
            {session.status === 'scheduled' && (
              <>
                <button
                  type="button"
                  data-testid={`session-complete-btn-${session.id}`}
                  onClick={() => onStatusChange(session.id, 'completed')}
                  title="Mark as Completed"
                  aria-label="Mark session as completed"
                  className="flex h-7 items-center gap-1 rounded-lg border border-status-success-border bg-status-success-subtle px-2 text-xs font-semibold text-status-success-text hover:bg-status-success-subtle/80 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span className="hidden sm:inline">Complete</span>
                </button>
                <button
                  type="button"
                  data-testid={`session-cancel-btn-${session.id}`}
                  onClick={() => onStatusChange(session.id, 'cancelled')}
                  title="Cancel Session"
                  aria-label="Cancel session"
                  className="flex h-7 items-center gap-1 rounded-lg border border-border bg-surface px-2 text-xs font-medium text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              </>
            )}

            {(session.status === 'completed' || session.status === 'cancelled') && (
              <button
                type="button"
                data-testid={`session-reopen-btn-${session.id}`}
                onClick={() => onStatusChange(session.id, 'scheduled')}
                title="Reopen Session"
                aria-label="Reopen session to scheduled"
                className="flex h-7 items-center gap-1 rounded-lg border border-status-info-border bg-status-info-subtle px-2 text-xs font-semibold text-status-info-text hover:bg-status-info-subtle/80 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="hidden sm:inline">Reopen</span>
              </button>
            )}

            <button
              type="button"
              data-testid={`session-edit-btn-${session.id}`}
              onClick={() => onEdit(session)}
              title="Edit Session"
              aria-label="Edit session"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>

            <button
              type="button"
              data-testid={`session-delete-btn-${session.id}`}
              onClick={() => onDelete(session.id)}
              title="Delete Session"
              aria-label="Delete session"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-status-danger-border bg-surface text-status-danger-text hover:bg-status-danger-subtle transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
