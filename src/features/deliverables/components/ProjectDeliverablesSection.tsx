import React, { useState } from 'react';
import { Package, Plus, AlertCircle } from 'lucide-react';
import { useProjectDeliverables } from '../hooks/useDeliverables';
import {
  useCreateDeliverable,
  useUpdateDeliverable,
  useUpdateDeliverableStatus,
  useDeleteDeliverable,
  useCreateRevision,
  useUpdateRevision,
} from '../hooks/useDeliverableMutations';
import { DeliverableCard } from './DeliverableCard';
import { DeliverableFormModal } from './DeliverableFormModal';
import { RevisionModal } from './RevisionModal';
import { EmptyState } from '@/components/ui/empty-state';
import { ContextHelp } from '@/components/ui/context-help';
import type { Deliverable, DeliverableStatus, RevisionStatus } from '../types';
import type { DeliverableFormValues } from '../schemas/deliverableSchemas';
import type { RevisionFormValues } from '../schemas/revisionSchemas';

interface ProjectDeliverablesSectionProps {
  workspaceId: string;
  projectId: string;
  isForceClosed?: boolean;
}

export const ProjectDeliverablesSection: React.FC<ProjectDeliverablesSectionProps> = ({
  workspaceId,
  projectId,
  isForceClosed = false,
}) => {
  const {
    data: deliverables = [],
    isLoading,
    error,
    refetch,
  } = useProjectDeliverables(workspaceId, projectId);

  const createMutation = useCreateDeliverable(workspaceId, projectId);
  const updateMutation = useUpdateDeliverable(workspaceId, projectId);
  const updateStatusMutation = useUpdateDeliverableStatus(workspaceId, projectId);
  const deleteMutation = useDeleteDeliverable(workspaceId, projectId);
  const createRevisionMutation = useCreateRevision(workspaceId, projectId);
  const updateRevisionMutation = useUpdateRevision(workspaceId, projectId);

  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null);
  const [revisionDeliverable, setRevisionDeliverable] = useState<Deliverable | null>(null);
  const [deliverableToDelete, setDeliverableToDelete] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const approvedCount = deliverables.filter((d) => d.status === 'approved').length;

  const handleOpenCreateModal = () => {
    setActionError(null);
    setEditingDeliverable(null);
    setIsDeliverableModalOpen(true);
  };

  const handleOpenEditModal = (deliv: Deliverable) => {
    setActionError(null);
    setEditingDeliverable(deliv);
    setIsDeliverableModalOpen(true);
  };

  const handleCloseDeliverableModal = () => {
    setIsDeliverableModalOpen(false);
    setEditingDeliverable(null);
  };

  const handleDeliverableSubmit = async (values: DeliverableFormValues) => {
    setActionError(null);
    try {
      if (editingDeliverable) {
        await updateMutation.mutateAsync({
          deliverableId: editingDeliverable.id,
          input: {
            label: values.label,
            quantity: values.quantity,
            type_label: values.type_label,
            deadline: values.deadline,
            status: values.status,
            notes: values.notes,
          },
        });
      } else {
        await createMutation.mutateAsync({
          label: values.label,
          quantity: values.quantity,
          type_label: values.type_label,
          deadline: values.deadline,
          status: values.status,
          notes: values.notes,
        });
      }
      handleCloseDeliverableModal();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to save deliverable');
    }
  };

  const handleStatusChange = async (deliverableId: string, newStatus: DeliverableStatus) => {
    setActionError(null);
    try {
      await updateStatusMutation.mutateAsync({ deliverableId, status: newStatus });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to update deliverable status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deliverableToDelete) return;
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(deliverableToDelete);
      setDeliverableToDelete(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete deliverable');
    }
  };

  const handleOpenRevisionModal = (deliv: Deliverable) => {
    setActionError(null);
    setRevisionDeliverable(deliv);
  };

  const handleCloseRevisionModal = () => {
    setRevisionDeliverable(null);
  };

  const handleRevisionSubmit = async (values: RevisionFormValues) => {
    if (!revisionDeliverable) return;
    setActionError(null);
    try {
      await createRevisionMutation.mutateAsync({
        deliverable_id: revisionDeliverable.id,
        feedback: values.feedback,
        due_date: values.due_date,
      });
      handleCloseRevisionModal();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to log revision');
    }
  };

  const handleUpdateRevisionStatus = async (
    deliverableId: string,
    revisionId: string,
    newStatus: RevisionStatus
  ) => {
    setActionError(null);
    try {
      await updateRevisionMutation.mutateAsync({
        deliverableId,
        revisionId,
        input: { status: newStatus },
      });

      // If revision is approved, mark deliverable as approved
      if (newStatus === 'approved') {
        await updateStatusMutation.mutateAsync({ deliverableId, status: 'approved' });
      } else if (newStatus === 'delivered') {
        await updateStatusMutation.mutateAsync({ deliverableId, status: 'awaiting_review' });
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to update revision status');
    }
  };

  return (
    <div data-testid="project-deliverables-section" className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary-text border border-primary-border">
            <Package className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-text-primary">Project Deliverables</h3>
              <ContextHelp
                title="Required Deliverables"
                description="Deliverables marked as Required must be approved by the client before a project is eligible for Normal Close. Unapproved required items will block standard project closure."
                guideAnchor="#deliverables-revisions"
                testId="deliverables-context-help"
              />
              <span
                data-testid="deliverables-count-badge"
                className="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-semibold text-text-secondary border border-border-subtle tabular-nums"
              >
                {deliverables.length}
              </span>
              {deliverables.length > 0 && (
                <span className="text-xs text-text-secondary tabular-nums">
                  ({approvedCount} of {deliverables.length} approved)
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Promised outputs, media assets, and revision feedback cycles
            </p>
          </div>
        </div>

        {!isForceClosed && (
          <button
            type="button"
            data-testid="add-deliverable-btn"
            onClick={handleOpenCreateModal}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Add Deliverable</span>
          </button>
        )}
      </div>

      {/* Global Action Error Alert */}
      {actionError && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-lg border border-status-danger-border bg-status-danger-subtle p-3 text-xs text-status-danger-text"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <p className="font-medium">{actionError}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div data-testid="deliverables-loading" className="space-y-3">
          <div className="h-20 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
          <div className="h-20 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
        </div>
      )}

      {/* Query Error */}
      {error && !isLoading && (
        <div
          role="alert"
          data-testid="deliverables-error"
          className="flex flex-col items-center justify-center rounded-xl border border-status-danger-border bg-surface p-6 text-center"
        >
          <AlertCircle className="h-6 w-6 text-status-danger-text mb-1" strokeWidth={1.75} />
          <h4 className="text-xs font-semibold text-text-primary">Failed to load deliverables</h4>
          <p className="mt-1 text-xs text-text-secondary">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && deliverables.length === 0 && (
        <div data-testid="deliverables-empty-state">
          <EmptyState
            icon={Package}
            title="No deliverables added yet"
            description="Add promised outputs like photo batches, highlight films, or album prints to track delivery and revision loops."
            action={
              !isForceClosed ? (
                <button
                  type="button"
                  data-testid="empty-add-deliverable-btn"
                  onClick={handleOpenCreateModal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>Add First Deliverable</span>
                </button>
              ) : undefined
            }
          />
        </div>
      )}

      {/* Deliverables List */}
      {!isLoading && !error && deliverables.length > 0 && (
        <div data-testid="deliverables-list" className="space-y-2.5">
          {deliverables.map((deliverable) => (
            <DeliverableCard
              key={deliverable.id}
              deliverable={deliverable}
              isForceClosed={isForceClosed}
              onEdit={handleOpenEditModal}
              onDelete={(id) => setDeliverableToDelete(id)}
              onStatusChange={handleStatusChange}
              onRequestRevision={handleOpenRevisionModal}
              onUpdateRevisionStatus={handleUpdateRevisionStatus}
            />
          ))}
        </div>
      )}

      {/* Deliverable Form Modal */}
      <DeliverableFormModal
        isOpen={isDeliverableModalOpen}
        onClose={handleCloseDeliverableModal}
        onSubmit={handleDeliverableSubmit}
        initialData={editingDeliverable}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Revision Modal */}
      <RevisionModal
        isOpen={Boolean(revisionDeliverable)}
        onClose={handleCloseRevisionModal}
        onSubmit={handleRevisionSubmit}
        deliverable={revisionDeliverable}
        isSubmitting={createRevisionMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      {deliverableToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-deliverable-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-sheet space-y-4">
            <h3 id="delete-deliverable-title" className="text-base font-semibold text-text-primary">
              Delete Deliverable?
            </h3>
            <p className="text-xs text-text-secondary">
              Are you sure you want to remove this deliverable? All associated revision cycles will
              also be removed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeliverableToDelete(null)}
                className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-delete-deliverable-btn"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="cursor-pointer rounded-lg bg-status-danger px-3 py-1.5 text-xs font-semibold text-white hover:bg-status-danger/90 transition-colors shadow-subtle disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
