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
import { EmptyState } from '@/components/ui/empty-state';
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
    const paidDate =
      newStatus === 'paid' ? payment.paid_date || new Date().toISOString().split('T')[0] : null;

    try {
      await updateMutation.mutateAsync({
        paymentId: payment.id,
        input: {
          status: newStatus,
          paid_date: paidDate,
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
      setActionError(err instanceof Error ? err.message : 'Failed to delete payment');
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
      {/* List Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Payment Schedule</h4>
          <p className="text-xs text-text-secondary">
            Structured invoice installments and client payments
          </p>
        </div>

        {!isForceClosed && (
          <button
            type="button"
            data-testid="add-payment-btn"
            onClick={handleOpenCreateModal}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Add Payment</span>
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
          className="flex flex-col items-center justify-center rounded-xl border border-status-danger-border bg-surface p-6 text-center"
        >
          <AlertCircle className="h-6 w-6 text-status-danger-text mb-1" strokeWidth={1.75} />
          <h4 className="text-xs font-semibold text-text-primary">Failed to load payments</h4>
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
      {!isLoading && !error && payments.length === 0 && (
        <div data-testid="payments-empty-state">
          <EmptyState
            icon={CreditCard}
            title="No payment schedule defined"
            description="Break down the project fee into down payments, progress payments, or final settlement milestones."
            action={
              !isForceClosed ? (
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>Schedule First Payment</span>
                </button>
              ) : undefined
            }
          />
        </div>
      )}

      {/* Payments List */}
      {!isLoading && !error && payments.length > 0 && (
        <div data-testid="payments-list" className="space-y-2.5">
          {payments.map((p) => {
            const isPaid = p.status === 'paid';

            return (
              <div
                key={p.id}
                data-testid={`payment-item-${p.id}`}
                className="group rounded-xl border border-border bg-surface p-4 shadow-2xs transition-all hover:border-border-subtle"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Left: Info */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <PaymentStatusBadge status={p.status} dueDate={p.due_date} />
                      <span className="text-sm font-semibold text-text-primary">
                        {p.label ||
                          (p.type === 'dp'
                            ? 'Down Payment'
                            : p.type === 'final'
                              ? 'Final Settlement'
                              : 'Installment')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                      <span className="flex items-center gap-1.5 text-text-muted">
                        <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Due: {formatDate(p.due_date)}
                      </span>

                      {isPaid && p.paid_date && (
                        <span className="flex items-center gap-1 text-status-success-text font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Paid on {formatDate(p.paid_date)}
                        </span>
                      )}

                      {p.payment_method && (
                        <span className="text-text-muted font-normal">
                          Method: {p.payment_method}
                        </span>
                      )}
                    </div>

                    {p.notes && (
                      <p className="text-xs text-text-muted italic truncate max-w-sm pt-0.5">
                        "{p.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
                    <span
                      data-testid={`payment-amount-${p.id}`}
                      className={`text-sm sm:text-base font-bold tabular-nums tracking-tight ${
                        isPaid ? 'text-status-success-text' : 'text-text-primary'
                      }`}
                    >
                      {formatMoney(p.amount, currency)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Mark Paid / Mark Pending Toggle */}
                      <button
                        type="button"
                        data-testid={`toggle-paid-${p.id}-btn`}
                        onClick={() => handleTogglePaidStatus(p)}
                        title={isPaid ? 'Mark as Pending' : 'Mark as Received/Paid'}
                        className={`flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                          isPaid
                            ? 'border border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary'
                            : 'border border-status-success-border bg-status-success-subtle text-status-success-text hover:bg-status-success-subtle/80'
                        }`}
                      >
                        {isPaid ? (
                          <>
                            <RotateCcw className="h-3 w-3" strokeWidth={1.75} />
                            <span className="hidden sm:inline">Mark Pending</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
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
                            <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </button>

                          <button
                            type="button"
                            data-testid={`delete-payment-${p.id}-btn`}
                            onClick={() => setPaymentToDelete(p.id)}
                            title="Delete Payment"
                            aria-label="Delete payment"
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
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-sheet space-y-4">
            <h3 id="delete-payment-title" className="text-base font-semibold text-text-primary">
              Delete Payment Milestone?
            </h3>
            <p className="text-xs text-text-secondary">
              Are you sure you want to remove this payment milestone from the project?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentToDelete(null)}
                className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-delete-payment-btn"
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
