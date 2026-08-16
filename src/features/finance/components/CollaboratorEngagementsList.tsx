import React, { useState } from 'react';
import { Users, User, Edit2, Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CollaboratorEngagementModal } from './CollaboratorEngagementModal';
import { EmptyState } from '@/components/ui/empty-state';
import { formatMoney } from '@/lib/money';
import {
  useProjectCollaboratorEngagements,
  useCreateCollaboratorEngagement,
  useUpdateCollaboratorEngagement,
  useDeleteCollaboratorEngagement,
} from '../hooks';
import type { CollaboratorEngagement } from '../types';
import type { CollaboratorEngagementFormValues } from '../schemas/financeSchemas';

interface CollaboratorEngagementsListProps {
  workspaceId: string;
  projectId: string;
  currency?: string;
  isForceClosed?: boolean;
}

export const CollaboratorEngagementsList: React.FC<CollaboratorEngagementsListProps> = ({
  workspaceId,
  projectId,
  currency = 'IDR',
  isForceClosed = false,
}) => {
  const {
    data: engagements = [],
    isLoading,
    error,
    refetch,
  } = useProjectCollaboratorEngagements(workspaceId, projectId);

  const createMutation = useCreateCollaboratorEngagement(workspaceId, projectId);
  const updateMutation = useUpdateCollaboratorEngagement(workspaceId, projectId);
  const deleteMutation = useDeleteCollaboratorEngagement(workspaceId, projectId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEngagement, setEditingEngagement] = useState<CollaboratorEngagement | null>(null);
  const [engagementToDelete, setEngagementToDelete] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const totalCrewFees = engagements.reduce((acc, c) => acc + (c.agreed_fee || 0), 0);

  const handleOpenCreateModal = () => {
    setActionError(null);
    setEditingEngagement(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e: CollaboratorEngagement) => {
    setActionError(null);
    setEditingEngagement(e);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEngagement(null);
  };

  const handleFormSubmit = async (values: CollaboratorEngagementFormValues) => {
    setActionError(null);
    try {
      if (editingEngagement) {
        await updateMutation.mutateAsync({
          engagementId: editingEngagement.id,
          input: {
            role_label: values.role_label,
            agreed_fee: values.agreed_fee,
            payment_status: values.payment_status,
            paid_amount: values.paid_amount,
            notes: values.notes,
          },
        });
      } else {
        await createMutation.mutateAsync({
          collaborator_id: values.collaborator_id,
          role_label: values.role_label,
          agreed_fee: values.agreed_fee,
          payment_status: values.payment_status,
          paid_amount: values.paid_amount,
          notes: values.notes,
        });
      }
      handleCloseModal();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to save crew engagement');
    }
  };

  const handleTogglePayoutStatus = async (engagement: CollaboratorEngagement) => {
    setActionError(null);
    const newStatus = engagement.payment_status === 'paid' ? 'unpaid' : 'paid';
    const newPaidAmount = newStatus === 'paid' ? engagement.agreed_fee : 0;
    try {
      await updateMutation.mutateAsync({
        engagementId: engagement.id,
        input: {
          payment_status: newStatus,
          paid_amount: newPaidAmount,
        },
      });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to update crew payout status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!engagementToDelete) return;
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(engagementToDelete);
      setEngagementToDelete(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to remove crew engagement');
    }
  };

  return (
    <div data-testid="collaborators-list-container" className="space-y-4">
      {/* List Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-text-primary">
              Crew & External Collaborators
            </h4>
            {engagements.length > 0 && (
              <span className="text-xs text-text-secondary tabular-nums font-normal">
                (Total: {formatMoney(totalCrewFees, currency)})
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary">
            Contractors, second shooters, assistants, and external specialists
          </p>
        </div>

        {!isForceClosed && (
          <button
            type="button"
            data-testid="add-collaborator-engagement-btn"
            onClick={handleOpenCreateModal}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Engage Crew</span>
          </button>
        )}
      </div>

      {/* Global Error Notice */}
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
        <div data-testid="collaborators-loading" className="space-y-3">
          <div className="h-16 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
          <div className="h-16 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
        </div>
      )}

      {/* Query Error */}
      {error && !isLoading && (
        <div
          role="alert"
          data-testid="collaborators-error"
          className="flex flex-col items-center justify-center rounded-xl border border-status-danger-border bg-surface p-6 text-center"
        >
          <AlertCircle className="h-6 w-6 text-status-danger-text mb-1" strokeWidth={1.75} />
          <h4 className="text-xs font-semibold text-text-primary">
            Failed to load crew engagements
          </h4>
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
      {!isLoading && !error && engagements.length === 0 && (
        <div data-testid="collaborators-empty-state">
          <EmptyState
            icon={Users}
            title="No crew members engaged"
            description="Assign external contractors, second shooters, editors, or sound technicians to this project to track agreed fees and payout statuses."
            action={
              !isForceClosed ? (
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>Engage First Crew Member</span>
                </button>
              ) : undefined
            }
          />
        </div>
      )}

      {/* Engagements List */}
      {!isLoading && !error && engagements.length > 0 && (
        <div data-testid="collaborator-engagements-list" className="space-y-2.5">
          {engagements.map((e) => {
            const isPaid = e.payment_status === 'paid';
            const isPartial = e.payment_status === 'partial';

            return (
              <div
                key={e.id}
                data-testid={`collaborator-engagement-item-${e.id}`}
                className="group rounded-xl border border-border bg-surface p-4 shadow-2xs transition-all hover:border-border-subtle"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Left: Info */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                          isPaid
                            ? 'border-status-success-border bg-status-success-subtle text-status-success-text font-semibold'
                            : isPartial
                              ? 'border-status-warning-border bg-status-warning-subtle text-status-warning-text font-semibold'
                              : 'border-border bg-surface-muted text-text-secondary'
                        }`}
                      >
                        {isPaid ? 'Paid in Full' : isPartial ? 'Partially Paid' : 'Unpaid'}
                      </span>

                      <span className="text-sm font-semibold text-text-primary">
                        {e.collaborator?.name || 'Crew Member'}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-secondary border border-border-subtle">
                        <User className="h-3 w-3 text-text-muted" strokeWidth={1.75} />
                        {e.role_label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                      {e.collaborator?.phone && (
                        <span className="text-text-muted">{e.collaborator.phone}</span>
                      )}
                      {e.collaborator?.email && (
                        <span className="text-text-muted">{e.collaborator.email}</span>
                      )}
                      {isPartial && e.paid_amount && (
                        <span className="text-status-warning-text font-medium tabular-nums">
                          Paid so far: {formatMoney(e.paid_amount, currency)}
                        </span>
                      )}
                    </div>

                    {e.notes && (
                      <p className="text-xs text-text-muted italic truncate max-w-sm pt-0.5">
                        "{e.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
                    <span
                      data-testid={`collaborator-fee-${e.id}`}
                      className="text-sm sm:text-base font-bold text-status-danger-text tabular-nums tracking-tight"
                    >
                      -{formatMoney(e.agreed_fee, currency)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Payout Toggle */}
                      <button
                        type="button"
                        data-testid={`toggle-crew-payout-btn-${e.id}`}
                        onClick={() => handleTogglePayoutStatus(e)}
                        title={isPaid ? 'Mark as Unpaid' : 'Mark as Paid in Full'}
                        className={`flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                          isPaid
                            ? 'border border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary'
                            : 'border border-status-success-border bg-status-success-subtle text-status-success-text hover:bg-status-success-subtle/80'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        <span>{isPaid ? 'Paid' : 'Mark Paid'}</span>
                      </button>

                      {!isForceClosed && (
                        <>
                          <button
                            type="button"
                            data-testid={`edit-engagement-btn-${e.id}`}
                            onClick={() => handleOpenEditModal(e)}
                            title="Edit Crew Engagement"
                            aria-label="Edit crew engagement"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </button>

                          <button
                            type="button"
                            data-testid={`delete-engagement-btn-${e.id}`}
                            onClick={() => setEngagementToDelete(e.id)}
                            title="Remove Crew Member"
                            aria-label="Remove crew member"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-status-danger-border bg-surface text-status-danger-text hover:bg-status-danger-subtle transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Engagement Modal */}
      <CollaboratorEngagementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={editingEngagement}
        workspaceId={workspaceId}
        currency={currency}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      {engagementToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-engagement-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-sheet space-y-4">
            <h3 id="delete-engagement-title" className="text-base font-semibold text-text-primary">
              Remove Crew Member?
            </h3>
            <p className="text-xs text-text-secondary">
              Are you sure you want to remove this collaborator engagement from the project?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEngagementToDelete(null)}
                className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-delete-engagement-btn"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="cursor-pointer rounded-lg bg-status-danger px-3 py-1.5 text-xs font-semibold text-white hover:bg-status-danger/90 transition-colors shadow-subtle disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
