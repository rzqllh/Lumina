import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  RotateCcw,
  Edit2,
  Trash2,
  Plus,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { PaymentFormModal } from './PaymentFormModal';
import { formatMoney } from '@/lib/money';
import { useProjectPayments, useCreatePayment, useUpdatePayment, useDeletePayment } from '../hooks';
import type { Payment } from '../types';
import type { PaymentFormValues } from '../schemas/financeSchemas';

interface PaymentsListProps {
  workspaceId: string;
  projectId: string;
  currency?: string;
  isForceClosed?: boolean;
}

export const PaymentsList: React.FC<PaymentsListProps> = ({
  workspaceId,
  projectId,
  currency = 'IDR',
  isForceClosed = false,
}) => {
  const {
    data: payments = [],
    isLoading,
    error,
    refetch,
  } = useProjectPayments(workspaceId, projectId);

  const createMutation = useCreatePayment(workspaceId, projectId);
  const updateMutation = useUpdatePayment(workspaceId, projectId);
  const deleteMutation = useDeletePayment(workspaceId, projectId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleOpenCreateModal = () => {
    setActionError(null);
    setEditingPayment(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Payment) => {
    setActionError(null);
    setEditingPayment(p);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPayment(null);
  };

  const handleFormSubmit = async (values: PaymentFormValues) => {
    setActionError(null);
    try {
      if (editingPayment) {
        await updateMutation.mutateAsync({
          paymentId: editingPayment.id,
          input: {
            type: values.type,
            label: values.label,
            amount: values.amount,
            due_date: values.due_date,
            status: values.status,
            paid_date: values.paid_date,
            payment_method: values.payment_method,
            notes: values.notes,
          },
        });
      } else {
        await createMutation.mutateAsync({
          type: values.type,
          label: values.label,
          amount: values.amount,
          due_date: values.due_date,
          status: values.status,
          paid_date: values.paid_date,
          payment_method: values.payment_method,
          notes: values.notes,
        });
      }
      handleCloseModal();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to save payment milestone');
    }
  };

  const handleTogglePaidStatus = async (payment: Payment) => {
    setActionError(null);
    const newStatus = payment.status === 'paid' ? 'pending' : 'paid';
    const today = new Date().toISOString().split('T')[0];
    try {
      await updateMutation.mutateAsync({
        paymentId: payment.id,
        input: {
          status: newStatus,
          paid_date: newStatus === 'paid' ? today : null,
        },
      });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to update payment status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(paymentToDelete);
      setPaymentToDelete(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete payment milestone');
    }
  };

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
    <div data-testid="payments-list-container" className="space-y-4">
      {/* Subheader */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Payment Milestones ({payments.length})
          </h4>
          <p className="text-xs text-text-secondary mt-0.5">
            Down payments, installment invoices, and settlements
          </p>
        </div>

        {/* Note: Adding new payments on force-closed project is blocked per freeze rules */}
        {!isForceClosed && (
          <button
            type="button"
            data-testid="add-payment-btn"
            onClick={handleOpenCreateModal}
            className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Plus className="h-4 w-4" />
            <span>Add Payment</span>
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
            className="text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div data-testid="payments-loading" className="space-y-3">
          <div className="h-16 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
          <div className="h-16 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
        </div>
      )}

      {/* Query Error */}
      {error && !isLoading && (
        <div
          role="alert"
          data-testid="payments-error"
          className="flex flex-col items-center justify-center rounded-xl border border-status-danger/25 bg-surface p-6 text-center"
        >
          <AlertCircle className="h-6 w-6 text-status-danger mb-1" />
          <h4 className="text-xs font-bold text-text-primary">Failed to load payments</h4>
          <p className="mt-1 text-xs text-text-secondary">
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
      {!isLoading && !error && payments.length === 0 && (
        <div
          data-testid="payments-empty-state"
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/30 p-8 text-center"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border text-text-secondary shadow-2xs mb-2">
            <CreditCard className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-text-primary">No payment milestones scheduled</h4>
          <p className="mt-1 max-w-xs text-xs text-text-secondary">
            Add payment schedules like initial deposit (DP), mid-project milestone, or final
            delivery settlement.
          </p>
          {!isForceClosed && (
            <button
              type="button"
              data-testid="empty-add-payment-btn"
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-primary shadow-2xs hover:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule First Payment</span>
            </button>
          )}
        </div>
      )}

      {/* Payments List */}
      {!isLoading && !error && payments.length > 0 && (
        <div data-testid="payments-list" className="space-y-2.5">
          {payments.map((p) => (
            <div
              key={p.id}
              data-testid={`payment-item-${p.id}`}
              className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-2xs transition-all hover:border-border-subtle"
            >
              {/* Left Info */}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <PaymentStatusBadge status={p.status} dueDate={p.due_date} />
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {p.type}
                  </span>
                  {p.label && (
                    <span className="text-xs font-bold text-text-primary truncate">{p.label}</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                  <span className="flex items-center gap-1 text-text-secondary">
                    <Calendar className="h-3.5 w-3.5 text-text-muted" />
                    Due: {formatDate(p.due_date)}
                  </span>
                  {p.paid_date && (
                    <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Paid: {formatDate(p.paid_date)}
                      {p.payment_method ? ` (${p.payment_method})` : ''}
                    </span>
                  )}
                  {p.notes && (
                    <span className="text-text-secondary italic truncate max-w-xs">
                      "{p.notes}"
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Amount & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center shrink-0">
                <div className="text-right">
                  <p
                    data-testid={`payment-amount-${p.id}`}
                    className={`text-sm sm:text-base font-bold ${
                      p.status === 'paid' ? 'text-emerald-700' : 'text-text-primary'
                    }`}
                  >
                    {formatMoney(p.amount, currency)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Mark Paid / Mark Pending is permitted even on force-closed projects */}
                  <button
                    type="button"
                    data-testid={`toggle-paid-${p.id}-btn`}
                    onClick={() => handleTogglePaidStatus(p)}
                    title={p.status === 'paid' ? 'Mark Pending' : 'Mark Received (Paid)'}
                    className={`flex h-7 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                      p.status === 'paid'
                        ? 'border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {p.status === 'paid' ? (
                      <>
                        <RotateCcw className="h-3 w-3" />
                        <span>Unmark</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Mark Paid</span>
                      </>
                    )}
                  </button>

                  {!isForceClosed && (
                    <>
                      <button
                        type="button"
                        data-testid={`edit-payment-${p.id}-btn`}
                        onClick={() => handleOpenEditModal(p)}
                        title="Edit Payment"
                        aria-label="Edit payment"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        data-testid={`delete-payment-${p.id}-btn`}
                        onClick={() => setPaymentToDelete(p.id)}
                        title="Delete Payment"
                        aria-label="Delete payment"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-status-danger/20 bg-surface text-status-danger hover:bg-status-danger/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Form Modal */}
      <PaymentFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={editingPayment}
        currency={currency}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      {paymentToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-payment-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-4">
            <h3 id="delete-payment-title" className="text-sm font-bold text-text-primary">
              Delete Payment Milestone?
            </h3>
            <p className="text-xs text-text-secondary">
              Are you sure you want to remove this payment schedule?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentToDelete(null)}
                className="cursor-pointer rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-delete-payment-btn"
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
