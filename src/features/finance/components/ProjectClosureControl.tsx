import React, { useState } from 'react';
import { Lock, Unlock, CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';
import { ForceCloseModal } from './ForceCloseModal';
import {
  useProjectFinancialSummary,
  useCloseProject,
  useForceCloseProject,
  useReopenProject,
} from '../hooks';
import type { Project } from '@/features/projects';

interface ProjectClosureControlProps {
  project: Project;
}

export const ProjectClosureControl: React.FC<ProjectClosureControlProps> = ({ project }) => {
  const { summary, isLoading: isSummaryLoading } = useProjectFinancialSummary(
    project.workspace_id,
    project.id
  );

  const closeMutation = useCloseProject(project.id);
  const forceCloseMutation = useForceCloseProject(project.id);
  const reopenMutation = useReopenProject(project.id);

  const [isForceCloseModalOpen, setIsForceCloseModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isClosed = project.status === 'closed';
  const isForceClosed = project.status === 'force_closed';

  const handleNormalClose = async () => {
    setErrorMsg(null);
    try {
      await closeMutation.mutateAsync();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to close project');
    }
  };

  const handleForceCloseConfirm = async (reason: string) => {
    setErrorMsg(null);
    try {
      await forceCloseMutation.mutateAsync(reason);
      setIsForceCloseModalOpen(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to force-close project');
    }
  };

  const handleReopen = async () => {
    setErrorMsg(null);
    try {
      await reopenMutation.mutateAsync();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to reopen project');
    }
  };

  return (
    <div
      data-testid="project-closure-control"
      className="rounded-xl border border-border bg-surface p-5 shadow-2xs space-y-4"
    >
      {/* Error Alert */}
      {errorMsg && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-lg border border-status-danger-border bg-status-danger-subtle p-3 text-xs text-status-danger-text"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <p className="font-medium">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Case 1: Active or Draft Project */}
      {!isClosed && !isForceClosed && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
              <h3 className="text-base font-semibold text-text-primary">
                Project Completion & Closure
              </h3>
            </div>
            <p className="text-xs text-text-secondary">
              {summary.canNormalClose
                ? 'All deliverables are approved and full payment is received. Project is eligible for normal closure.'
                : 'Normal closure requires all deliverables approved and full payment received.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {/* Normal Close Button */}
            <button
              type="button"
              data-testid="normal-close-btn"
              disabled={!summary.canNormalClose || closeMutation.isPending || isSummaryLoading}
              onClick={handleNormalClose}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-status-success-text px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-status-success-text/90 shadow-subtle disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>{closeMutation.isPending ? 'Closing...' : 'Close Project'}</span>
            </button>

            {/* Force Close Button */}
            <button
              type="button"
              data-testid="open-force-close-modal-btn"
              onClick={() => setIsForceCloseModalOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-status-danger-border bg-status-danger-subtle px-3 py-2 text-xs font-semibold text-status-danger-text transition-colors hover:bg-status-danger-subtle/80"
            >
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Force-Close Override</span>
            </button>
          </div>
        </div>
      )}

      {/* Case 2: Normal Closed State */}
      {isClosed && (
        <div
          data-testid="project-closed-banner"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-status-success-border bg-status-success-subtle p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface border border-status-success-border text-status-success-text">
              <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-status-success-text">
                Project Officially Closed
              </h4>
              <p className="text-xs text-status-success-text/90">
                Deliverables approved and full payment settled.
                {project.closed_at && (
                  <span> Closed on {new Date(project.closed_at).toLocaleDateString()}.</span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="reopen-project-btn"
            onClick={handleReopen}
            disabled={reopenMutation.isPending}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary shadow-subtle hover:bg-surface-muted transition-colors disabled:opacity-50"
          >
            <Unlock className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>{reopenMutation.isPending ? 'Reopening...' : 'Reopen Project'}</span>
          </button>
        </div>
      )}

      {/* Case 3: Force Closed State */}
      {isForceClosed && (
        <div
          data-testid="project-force-closed-banner"
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 rounded-xl border border-status-danger-border bg-status-danger-subtle p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-status-danger-text border border-status-danger-border">
              <ShieldAlert className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-status-danger-text">
                Project Force-Closed (Operational Freeze Active)
              </h4>
              <p className="text-xs text-text-secondary">
                Production workflows, stage creations, and task mutations are frozen.
              </p>
              {project.force_close_reason && (
                <p className="text-xs font-medium text-text-primary italic">
                  Reason: "{project.force_close_reason}"
                </p>
              )}
              {project.force_closed_at && (
                <p className="text-xs text-text-muted">
                  Recorded on {new Date(project.force_closed_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            data-testid="reopen-force-closed-btn"
            onClick={handleReopen}
            disabled={reopenMutation.isPending}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-primary shadow-subtle hover:bg-surface-muted transition-colors disabled:opacity-50 shrink-0 self-start sm:self-center"
          >
            <Unlock className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>{reopenMutation.isPending ? 'Reopening...' : 'Reopen Project'}</span>
          </button>
        </div>
      )}

      {/* Force-Close Modal */}
      <ForceCloseModal
        isOpen={isForceCloseModalOpen}
        onClose={() => setIsForceCloseModalOpen(false)}
        onConfirm={handleForceCloseConfirm}
        isSubmitting={forceCloseMutation.isPending}
      />
    </div>
  );
};
