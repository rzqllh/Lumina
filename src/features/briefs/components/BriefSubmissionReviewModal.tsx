import React, { useState } from 'react';
import type { Brief, BriefSubmission } from '../types';
import { useApplyBriefSubmissionReview } from '../hooks/useBriefMutations';
import { formatDate } from '@/lib/utils';
import { X, Inbox, Check, CheckCheck, ArrowRight, Sparkles } from 'lucide-react';

interface BriefSubmissionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  projectId: string;
  brief: Brief;
  submissions: BriefSubmission[];
}

export const BriefSubmissionReviewModal: React.FC<BriefSubmissionReviewModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  projectId,
  brief,
  submissions,
}) => {
  const pendingSubmissions = submissions.filter((s) => s.review_status === 'pending');
  const [activeSubmissionIndex, setActiveSubmissionIndex] = useState(0);
  const currentSubmission = pendingSubmissions[activeSubmissionIndex] || null;

  // Track accepted field IDs
  const [acceptedFieldIds, setAcceptedFieldIds] = useState<Set<string>>(new Set());

  const applyReviewMutation = useApplyBriefSubmissionReview(workspaceId, projectId, brief.id);

  // Flatten all brief fields for easy lookup
  const allFields = React.useMemo(() => {
    const list: Array<{
      id: string;
      label: string;
      currentValue: unknown;
      submittedValue: unknown;
    }> = [];

    if (!currentSubmission || !brief.sections) return list;

    for (const s of brief.sections) {
      for (const f of s.fields || []) {
        if (f.id in currentSubmission.submitted_values) {
          list.push({
            id: f.id,
            label: f.label,
            currentValue: f.value,
            submittedValue: currentSubmission.submitted_values[f.id],
          });
        }
      }
    }
    return list;
  }, [brief, currentSubmission]);

  React.useEffect(() => {
    if (currentSubmission) {
      // By default, pre-select all submitted fields as accepted
      setAcceptedFieldIds(new Set(allFields.map((f) => f.id)));
    }
  }, [currentSubmission, allFields]);

  if (!isOpen) return null;

  function toggleFieldAcceptance(fieldId: string) {
    const next = new Set(acceptedFieldIds);
    if (next.has(fieldId)) {
      next.delete(fieldId);
    } else {
      next.add(fieldId);
    }
    setAcceptedFieldIds(next);
  }

  function handleSelectAll() {
    setAcceptedFieldIds(new Set(allFields.map((f) => f.id)));
  }

  async function handleApplyReview() {
    if (!currentSubmission) return;

    const acceptedPayload: Array<{ field_id: string; value: unknown }> = [];
    for (const f of allFields) {
      if (acceptedFieldIds.has(f.id)) {
        acceptedPayload.push({
          field_id: f.id,
          value: f.submittedValue,
        });
      }
    }

    await applyReviewMutation.mutateAsync({
      submissionId: currentSubmission.id,
      acceptedFields: acceptedPayload,
    });

    if (pendingSubmissions.length <= 1) {
      onClose();
    } else {
      setActiveSubmissionIndex(0);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div
        data-testid="brief-submission-review-modal"
        className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Inbox className="h-4 w-4 text-primary" />
              Client Brief Submissions Review
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Review questionnaire answers submitted by your client before updating project truth
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {pendingSubmissions.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Sparkles className="mx-auto h-8 w-8 text-primary/60" />
            <p className="text-sm font-bold text-text-primary">All caught up!</p>
            <p className="text-xs text-text-muted">No pending client submissions to review.</p>
          </div>
        ) : !currentSubmission ? null : (
          <div className="space-y-4">
            {/* Header / Submission Switcher */}
            <div className="flex items-center justify-between rounded-xl bg-surface-muted/40 p-3 text-xs">
              <span className="font-semibold text-text-secondary">
                Submitted on {formatDate(currentSubmission.submitted_at)}
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Select All Answers
              </button>
            </div>

            {/* Answer Comparison Rows */}
            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {allFields.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-6">
                  No matching field values in this submission.
                </p>
              ) : (
                allFields.map((f) => {
                  const isAccepted = acceptedFieldIds.has(f.id);

                  return (
                    <div
                      key={f.id}
                      data-testid={`submission-field-row-${f.id}`}
                      className={`rounded-xl border p-3 transition-all ${
                        isAccepted
                          ? 'border-primary/40 bg-primary/5 shadow-2xs'
                          : 'border-border bg-surface opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <span className="text-xs font-bold text-text-primary block">
                            {f.label}
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="rounded-lg bg-surface-muted/60 p-2 text-text-muted">
                              <span className="text-[10px] uppercase font-bold text-text-muted block mb-0.5">
                                Current Value:
                              </span>
                              <span className="text-text-secondary font-medium">
                                {f.currentValue !== null && f.currentValue !== undefined
                                  ? String(f.currentValue)
                                  : '(Empty)'}
                              </span>
                            </div>

                            <div className="rounded-lg bg-emerald-50/70 border border-emerald-200/70 p-2 text-emerald-900">
                              <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-0.5 flex items-center gap-1">
                                <ArrowRight className="h-2.5 w-2.5" />
                                Submitted by Client:
                              </span>
                              <span className="font-semibold">
                                {f.submittedValue !== null && f.submittedValue !== undefined
                                  ? String(f.submittedValue)
                                  : '(Empty)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          data-testid={`toggle-accept-field-${f.id}`}
                          onClick={() => toggleFieldAcceptance(f.id)}
                          className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                            isAccepted
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                              : 'border border-border text-text-secondary hover:bg-surface-muted'
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          {isAccepted ? 'Accepted' : 'Accept'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-text-muted">
                {acceptedFieldIds.size} of {allFields.length} answers accepted
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={applyReviewMutation.isPending}
                  onClick={handleApplyReview}
                  data-testid="apply-submission-review-btn"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {applyReviewMutation.isPending
                    ? 'Applying...'
                    : 'Apply Accepted Answers to Project'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
