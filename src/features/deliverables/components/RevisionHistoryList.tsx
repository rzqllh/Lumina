import React from 'react';
import { Calendar, CheckCircle2, Send, Clock, MessageSquareQuote } from 'lucide-react';
import { RevisionStatusBadge } from './RevisionStatusBadge';
import type { Revision, RevisionStatus } from '../types';

interface RevisionHistoryListProps {
  revisions: Revision[];
  isForceClosed?: boolean;
  onUpdateRevisionStatus: (revisionId: string, newStatus: RevisionStatus) => void;
}

export const RevisionHistoryList: React.FC<RevisionHistoryListProps> = ({
  revisions,
  isForceClosed = false,
  onUpdateRevisionStatus,
}) => {
  if (revisions.length === 0) return null;

  return (
    <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
      <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Revision History ({revisions.length})
      </h5>

      <div className="space-y-2">
        {revisions.map((rev) => (
          <div
            key={rev.id}
            data-testid={`revision-item-${rev.revision_number}`}
            className="rounded-lg border border-border-subtle bg-surface-muted/30 p-3 text-xs space-y-2"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">
                  Round #{rev.revision_number}
                </span>
                <RevisionStatusBadge status={rev.status} />
              </div>

              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" strokeWidth={1.75} />
                  Req: {rev.requested_date}
                </span>
                {rev.due_date && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" strokeWidth={1.75} />
                    Due: {rev.due_date}
                  </span>
                )}
              </div>
            </div>

            {/* Client Feedback */}
            <div className="flex items-start gap-1.5 rounded-md bg-surface p-2 text-text-secondary border border-border-subtle">
              <MessageSquareQuote
                className="h-3.5 w-3.5 text-primary-text shrink-0 mt-0.5"
                strokeWidth={1.75}
              />
              <p className="whitespace-pre-wrap">{rev.feedback}</p>
            </div>

            {/* Revision Actions */}
            {!isForceClosed && rev.status !== 'approved' && (
              <div className="flex items-center justify-end gap-1.5 pt-1">
                {rev.status === 'requested' && (
                  <button
                    type="button"
                    data-testid={`start-rev-${rev.revision_number}-btn`}
                    onClick={() => onUpdateRevisionStatus(rev.id, 'in_progress')}
                    className="flex h-6 cursor-pointer items-center gap-1 rounded-md border border-primary-border bg-primary-subtle px-2 text-xs font-semibold text-primary-text hover:bg-primary-subtle/80 transition-colors"
                  >
                    <span>Start Work</span>
                  </button>
                )}

                {rev.status === 'in_progress' && (
                  <button
                    type="button"
                    data-testid={`deliver-rev-${rev.revision_number}-btn`}
                    onClick={() => onUpdateRevisionStatus(rev.id, 'delivered')}
                    className="flex h-6 cursor-pointer items-center gap-1 rounded-md border border-status-info-border bg-status-info-subtle px-2 text-xs font-semibold text-status-info-text hover:bg-status-info-subtle/80 transition-colors"
                  >
                    <Send className="h-3 w-3" strokeWidth={1.75} />
                    <span>Send Revised Version</span>
                  </button>
                )}

                {(rev.status === 'delivered' || rev.status === 'awaiting_review') && (
                  <button
                    type="button"
                    data-testid={`approve-rev-${rev.revision_number}-btn`}
                    onClick={() => onUpdateRevisionStatus(rev.id, 'approved')}
                    className="flex h-6 cursor-pointer items-center gap-1 rounded-md border border-status-success-border bg-status-success-subtle px-2 text-xs font-semibold text-status-success-text hover:bg-status-success-subtle/80 transition-colors"
                  >
                    <CheckCircle2 className="h-3 w-3" strokeWidth={1.75} />
                    <span>Approve Revision</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
