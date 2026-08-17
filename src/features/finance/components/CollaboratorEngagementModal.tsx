import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Users, Plus } from 'lucide-react';
import { ContextHelp } from '@/components/ui/context-help';
import {
  collaboratorEngagementFormSchema,
  type CollaboratorEngagementFormValues,
  type CollaboratorFormValues,
} from '../schemas/financeSchemas';
import { useWorkspaceCollaborators } from '../hooks';
import { useCreateCollaborator } from '../hooks/useFinanceMutations';
import { CollaboratorFormModal } from './CollaboratorFormModal';
import type { Collaborator, CollaboratorEngagement } from '../types';

interface CollaboratorEngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CollaboratorEngagementFormValues) => Promise<void>;
  initialData?: CollaboratorEngagement | null;
  workspaceId: string;
  currency?: string;
  isSubmitting?: boolean;
}

const EMPTY_COLLABORATORS: Collaborator[] = [];

export const CollaboratorEngagementModal: React.FC<CollaboratorEngagementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  workspaceId,
  currency = 'IDR',
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialData);
  const [isCreateCollabOpen, setIsCreateCollabOpen] = useState(false);

  const { data: collaborators = EMPTY_COLLABORATORS, isLoading: isLoadingCollaborators } =
    useWorkspaceCollaborators(workspaceId);
  const createCollabMutation = useCreateCollaborator(workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CollaboratorEngagementFormValues>({
    resolver: zodResolver(collaboratorEngagementFormSchema),
    defaultValues: {
      collaborator_id: initialData?.collaborator_id || '',
      role_label: initialData?.role_label || '',
      agreed_fee: initialData?.agreed_fee || 0,
      payment_status: initialData?.payment_status || 'unpaid',
      paid_amount: initialData?.paid_amount || 0,
      notes: initialData?.notes || '',
    },
  });

  const paymentStatus = watch('payment_status');
  const firstCollaboratorId = collaborators[0]?.id || '';

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          collaborator_id: initialData.collaborator_id,
          role_label: initialData.role_label,
          agreed_fee: initialData.agreed_fee,
          payment_status: initialData.payment_status,
          paid_amount: initialData.paid_amount,
          notes: initialData.notes || '',
        });
      } else {
        reset({
          collaborator_id: firstCollaboratorId,
          role_label: '',
          agreed_fee: 0,
          payment_status: 'unpaid',
          paid_amount: 0,
          notes: '',
        });
      }
    }
  }, [isOpen, initialData, reset, firstCollaboratorId]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: CollaboratorEngagementFormValues) => {
    await onSubmit({
      ...values,
      notes: values.notes?.trim() || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="collaborator-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md rounded-xl border border-border bg-surface shadow-sheet flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary-text border border-primary-border">
              <Users className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2
                  id="collaborator-modal-title"
                  className="text-base font-semibold text-text-primary"
                >
                  {isEditing ? 'Edit Crew Engagement' : 'Engage External Crew'}
                </h2>
                <ContextHelp
                  title="Crew Engagements & Fees"
                  description="Assigning a crew member with an agreed fee commits that cost to Total Project Cost, immediately updating your Projected Profit."
                  guideAnchor="#collaborators-costs"
                  testId="collab-modal-context-help"
                />
              </div>
              <p className="text-xs text-text-secondary">
                {isEditing
                  ? 'Update crew member fee and payment.'
                  : 'Assign a contractor or assistant to this project.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Collaborator Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="collaborator-select"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Collaborator / Crew Member <span className="text-status-danger-text">*</span>
              </label>
              {!isEditing && (
                <button
                  type="button"
                  data-testid="inline-add-collaborator-btn"
                  onClick={() => setIsCreateCollabOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary-text hover:underline cursor-pointer"
                >
                  <Plus className="h-3 w-3" strokeWidth={1.75} />
                  <span>New Crew Member</span>
                </button>
              )}
            </div>
            {collaborators.length > 0 ? (
              <select
                id="collaborator-select"
                {...register('collaborator_id')}
                disabled={isEditing}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              >
                {collaborators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.specialty ? `(${c.specialty})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-dashed border-border p-3 text-xs text-text-muted">
                <span>
                  {isLoadingCollaborators
                    ? 'Loading crew catalog...'
                    : 'No collaborators in workspace catalog yet.'}
                </span>
                <button
                  type="button"
                  data-testid="empty-inline-add-collaborator-btn"
                  onClick={() => setIsCreateCollabOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary-subtle border border-primary-border px-2.5 py-1 text-xs font-semibold text-primary-text hover:bg-primary-subtle/80 cursor-pointer"
                >
                  <Plus className="h-3 w-3" strokeWidth={1.75} />
                  <span>Create First</span>
                </button>
              </div>
            )}
            {errors.collaborator_id && (
              <p className="mt-1 text-xs text-status-danger-text">
                {errors.collaborator_id.message}
              </p>
            )}
          </div>

          {/* Role Label */}
          <div>
            <label
              htmlFor="role-label"
              className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
            >
              Assigned Role on Project <span className="text-status-danger-text">*</span>
            </label>
            <input
              id="role-label"
              type="text"
              placeholder="e.g., Second Shooter, Drone Operator, Colorist"
              {...register('role_label')}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.role_label && (
              <p className="mt-1 text-xs text-status-danger-text">{errors.role_label.message}</p>
            )}
          </div>

          {/* Agreed Fee */}
          <div>
            <label
              htmlFor="agreed-fee"
              className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
            >
              Agreed Fee ({currency}) <span className="text-status-danger-text">*</span>
            </label>
            <input
              id="agreed-fee"
              type="number"
              min="0"
              placeholder="e.g., 2000000"
              {...register('agreed_fee', { valueAsNumber: true })}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.agreed_fee && (
              <p className="mt-1 text-xs text-status-danger-text">{errors.agreed_fee.message}</p>
            )}
          </div>

          {/* Payout Status & Paid Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="crew-payment-status"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
              >
                Payout Status
              </label>
              <select
                id="crew-payment-status"
                {...register('payment_status')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid in Full</option>
              </select>
            </div>

            {paymentStatus !== 'unpaid' && (
              <div>
                <label
                  htmlFor="crew-paid-amount"
                  className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
                >
                  Paid Amount ({currency})
                </label>
                <input
                  id="crew-paid-amount"
                  type="number"
                  min="0"
                  placeholder="e.g., 1000000"
                  {...register('paid_amount', { valueAsNumber: true })}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="crew-notes"
              className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
            >
              Notes
            </label>
            <textarea
              id="crew-notes"
              rows={2}
              placeholder="Call time requirements, gear provided..."
              {...register('notes')}
              className="w-full rounded-lg border border-border bg-surface p-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="collaborator-submit-btn"
              disabled={isSubmitting || (collaborators.length === 0 && !isEditing)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Engage Crew'}</span>
              )}
            </button>
          </div>
        </form>

        {/* Inline Create Collaborator Modal */}
        <CollaboratorFormModal
          isOpen={isCreateCollabOpen}
          onClose={() => setIsCreateCollabOpen(false)}
          onSubmit={async (values: CollaboratorFormValues) => {
            const newCollab = await createCollabMutation.mutateAsync(values);
            if (newCollab?.id) {
              setValue('collaborator_id', newCollab.id);
            }
            setIsCreateCollabOpen(false);
          }}
          isSubmitting={createCollabMutation.isPending}
        />
      </div>
    </div>
  );
};
