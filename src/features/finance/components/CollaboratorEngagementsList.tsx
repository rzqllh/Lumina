import React, { useState } from 'react';
import { Users, User, Edit2, Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CollaboratorEngagementModal } from './CollaboratorEngagementModal';
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

  const getPayoutBadge = (status: 'unpaid' | 'partial' | 'paid') => {
    switch (status) {
      case 'paid':
        return {
          label: 'Paid in Full',
          style: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
        };
      case 'partial':
        return {
          label: 'Partial',
          style: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'unpaid':
      default:
        return {
          label: 'Unpaid',
          style: 'bg-zinc-100 text-zinc-600 border-zinc-200',
        };
    }
  };

  return (
    <div data-testid="collaborators-list-container" className="space-y-4">
      {/* Subheader */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Crew & Collaborators ({engagements.length})
            </h4>
            {engagements.length > 0 && (
              <span className="text-xs font-bold text-text-primary">
                • {formatMoney(totalCrewFees, currency)}
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted">
            Second shooters, drone pilots, lighting technicians, and external editors
          </p>
        </div>

        {!isForceClosed && (
          <button
            type="button"
            data-testid="add-collaborator-btn"
            onClick={handleOpenCreateModal}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-98"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Engage Crew</span>
          </button>
        )}
      </div>

      {/* Global Error Alert */}
      {actionError && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-status-danger/25 bg-status-danger/8 p-3 text-xs text-status-danger"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="font-medium">{actionError}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-[11px] font-bold underline cursor-pointer"
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
          className="flex flex-col items-center justify-center rounded-xl border border-status-danger/25 bg-surface p-6 text-center"
        >
          <AlertCircle className="h-6 w-6 text-status-danger mb-1" />
          <h4 className="text-xs font-bold text-text-primary">Failed to load crew engagements</h4>
          <p className="mt-1 text-[11px] text-text-secondary">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && engagements.length === 0 && (
        <div
          data-testid="collaborators-empty-state"
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/30 p-8 text-center"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border text-text-muted shadow-2xs mb-2">
            <Users className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-text-primary">No external crew engaged</h4>
          <p className="mt-1 max-w-xs text-[11px] text-text-muted">
            Track hired talent fees like second shooters, assistants, or sound technicians.
          </p>
          {!isForceClosed && (
            <button
              type="button"
              data-testid="empty-add-collaborator-btn"
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary shadow-2xs hover:bg-surface-muted transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Engage First Crew Member</span>
            </button>
          )}
        </div>
      )}

      {/* Engagements List */}
      {!isLoading && !error && engagements.length > 0 && (
        <div data-testid="collaborators-list" className="space-y-2.5">
          {engagements.map((eng) => {
            const badge = getPayoutBadge(eng.payment_status);
            return (
              <div
                key={eng.id}
                data-testid={`collaborator-item-${eng.id}`}
                className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-2xs transition-all hover:border-border-subtle"
              >
                {/* Left Info */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${badge.style}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-xs font-bold text-text-primary">
                      {eng.collaborator?.name || 'Assigned Crew Member'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-secondary border border-border-subtle">
                      <User className="h-3 w-3" />
                      {eng.role_label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                    <span>Fee: {formatMoney(eng.agreed_fee, currency)}</span>
                    {eng.paid_amount > 0 && eng.paid_amount < eng.agreed_fee && (
                      <span className="text-text-muted">
                        Paid: {formatMoney(eng.paid_amount, currency)}
                      </span>
                    )}
                    {eng.notes && (
                      <span className="text-text-muted italic truncate max-w-xs">
                        "{eng.notes}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center shrink-0">
                  <p
                    data-testid={`collaborator-fee-${eng.id}`}
                    className="text-sm sm:text-base font-bold text-text-primary"
                  >
                    {formatMoney(eng.agreed_fee, currency)}
                  </p>

                  {!isForceClosed && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        data-testid={`toggle-crew-payout-${eng.id}-btn`}
                        onClick={() => handleTogglePayoutStatus(eng)}
                        title={eng.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid in Full'}
                        className={`flex h-7 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                          eng.payment_status === 'paid'
                            ? 'border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{eng.payment_status === 'paid' ? 'Unmark' : 'Paid'}</span>
                      </button>

                      <button
                        type="button"
                        data-testid={`edit-collaborator-${eng.id}-btn`}
                        onClick={() => handleOpenEditModal(eng)}
                        title="Edit Engagement"
                        aria-label="Edit crew engagement"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        data-testid={`delete-collaborator-${eng.id}-btn`}
                        onClick={() => setEngagementToDelete(eng.id)}
                        title="Remove Engagement"
                        aria-label="Remove crew engagement"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-status-danger/20 bg-surface text-status-danger hover:bg-status-danger/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Engagement Form Modal */}
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
          aria-labelledby="delete-collaborator-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-4">
            <h3 id="delete-collaborator-title" className="text-sm font-bold text-text-primary">
              Remove Crew Member?
            </h3>
            <p className="text-xs text-text-secondary">
              Are you sure you want to remove this collaborator engagement from the project?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEngagementToDelete(null)}
                className="cursor-pointer rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-delete-collaborator-btn"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="cursor-pointer rounded-xl bg-status-danger px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
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
