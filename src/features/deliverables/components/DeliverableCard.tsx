import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Send,
  Play,
  RotateCcw,
  RefreshCw,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  Package,
} from 'lucide-react';
import { DeliverableStatusBadge } from './DeliverableStatusBadge';
import { RevisionHistoryList } from './RevisionHistoryList';
import type { Deliverable, DeliverableStatus, RevisionStatus } from '../types';

interface DeliverableCardProps {
  deliverable: Deliverable;
  isForceClosed?: boolean;
  onEdit: (deliverable: Deliverable) => void;
  onDelete: (deliverableId: string) => void;
  onStatusChange: (deliverableId: string, newStatus: DeliverableStatus) => void;
  onRequestRevision: (deliverable: Deliverable) => void;
  onUpdateRevisionStatus: (
    deliverableId: string,
    revisionId: string,
    newStatus: RevisionStatus
  ) => void;
}

export const DeliverableCard: React.FC<DeliverableCardProps> = ({
  deliverable,
  isForceClosed = false,
  onEdit,
  onDelete,
  onStatusChange,
  onRequestRevision,
  onUpdateRevisionStatus,
}) => {
  const [showRevisions, setShowRevisions] = useState(true);
  const revisions = deliverable.revisions || [];
  const revisionCount = revisions.length;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      data-testid={`deliverable-card-${deliverable.id}`}
      className="group rounded-xl border border-border bg-surface p-4 shadow-2xs transition-all hover:border-border-subtle"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Main Info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <DeliverableStatusBadge status={deliverable.status} />

            {deliverable.type_label && (
              <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-secondary border border-border-subtle">
                <Tag className="h-3 w-3" />
                {deliverable.type_label}
              </span>
            )}

            {deliverable.quantity && deliverable.quantity > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-secondary border border-border-subtle">
                <Package className="h-3 w-3" />
                Qty: {deliverable.quantity}
              </span>
            )}

            {revisionCount > 0 && (
              <button
                type="button"
                onClick={() => setShowRevisions(!showRevisions)}
                className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200 cursor-pointer hover:bg-rose-100"
              >
                <RefreshCw className="h-2.5 w-2.5" />
                <span>
                  {revisionCount} rev{revisionCount > 1 ? 's' : ''}
                </span>
                {showRevisions ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            )}
          </div>

          <h4 className="text-sm font-bold text-text-primary">{deliverable.label}</h4>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
            {deliverable.deadline && (
              <span className="flex items-center gap-1.5 text-text-muted">
                <Calendar className="h-3.5 w-3.5" />
                Due: {formatDate(deliverable.deadline)}
              </span>
            )}

            {deliverable.notes && (
              <span className="text-xs text-text-muted italic truncate max-w-sm">
                "{deliverable.notes}"
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!isForceClosed && (
          <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-start shrink-0 pt-1">
            {deliverable.status === 'planned' && (
              <button
                type="button"
                data-testid={`start-deliv-${deliverable.id}-btn`}
                onClick={() => onStatusChange(deliverable.id, 'in_progress')}
                className="flex h-7 items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Play className="h-3 w-3" />
                <span>Start</span>
              </button>
            )}

            {deliverable.status === 'in_progress' && (
              <button
                type="button"
                data-testid={`deliver-deliv-${deliverable.id}-btn`}
                onClick={() => onStatusChange(deliverable.id, 'delivered')}
                className="flex h-7 items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer"
              >
                <Send className="h-3 w-3" />
                <span>Deliver</span>
              </button>
            )}

            {(deliverable.status === 'delivered' ||
              deliverable.status === 'awaiting_review' ||
              deliverable.status === 'revision_requested') && (
              <>
                <button
                  type="button"
                  data-testid={`request-rev-${deliverable.id}-btn`}
                  onClick={() => onRequestRevision(deliverable)}
                  className="flex h-7 items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Revision</span>
                </button>
                <button
                  type="button"
                  data-testid={`approve-deliv-${deliverable.id}-btn`}
                  onClick={() => onStatusChange(deliverable.id, 'approved')}
                  className="flex h-7 items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Approve</span>
                </button>
              </>
            )}

            {deliverable.status === 'approved' && (
              <button
                type="button"
                data-testid={`reopen-deliv-${deliverable.id}-btn`}
                onClick={() => onStatusChange(deliverable.id, 'in_progress')}
                title="Reopen Deliverable"
                className="flex h-7 items-center gap-1 rounded-lg border border-border bg-surface px-2 text-xs font-medium text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reopen</span>
              </button>
            )}

            <button
              type="button"
              data-testid={`edit-deliv-${deliverable.id}-btn`}
              onClick={() => onEdit(deliverable)}
              title="Edit Deliverable"
              aria-label="Edit deliverable"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              data-testid={`delete-deliv-${deliverable.id}-btn`}
              onClick={() => onDelete(deliverable.id)}
              title="Delete Deliverable"
              aria-label="Delete deliverable"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-status-danger/20 bg-surface text-status-danger hover:bg-status-danger/10 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Revision Rounds Accordion */}
      {showRevisions && revisions.length > 0 && (
        <RevisionHistoryList
          revisions={revisions}
          isForceClosed={isForceClosed}
          onUpdateRevisionStatus={(revId, newStatus) =>
            onUpdateRevisionStatus(deliverable.id, revId, newStatus)
          }
        />
      )}
    </div>
  );
};
