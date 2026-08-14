import React, { useState } from 'react';
import { Calendar, Tag, Edit2, Trash2, Plus, AlertCircle, Receipt } from 'lucide-react';
import { ExpenseFormModal } from './ExpenseFormModal';
import { formatMoney } from '@/lib/money';
import { useProjectExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '../hooks';
import type { Expense } from '../types';
import type { ExpenseFormValues } from '../schemas/financeSchemas';

interface ExpensesListProps {
  workspaceId: string;
  projectId: string;
  currency?: string;
  isForceClosed?: boolean;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({
  workspaceId,
  projectId,
  currency = 'IDR',
  isForceClosed = false,
}) => {
  const {
    data: expenses = [],
    isLoading,
    error,
    refetch,
  } = useProjectExpenses(workspaceId, projectId);

  const createMutation = useCreateExpense(workspaceId, projectId);
  const updateMutation = useUpdateExpense(workspaceId, projectId);
  const deleteMutation = useDeleteExpense(workspaceId, projectId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  const handleOpenCreateModal = () => {
    setActionError(null);
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e: Expense) => {
    setActionError(null);
    setEditingExpense(e);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleFormSubmit = async (values: ExpenseFormValues) => {
    setActionError(null);
    try {
      if (editingExpense) {
        await updateMutation.mutateAsync({
          expenseId: editingExpense.id,
          input: {
            label: values.label,
            amount: values.amount,
            date: values.date,
            category: values.category,
            notes: values.notes,
          },
        });
      } else {
        await createMutation.mutateAsync({
          label: values.label,
          amount: values.amount,
          date: values.date,
          category: values.category,
          notes: values.notes,
        });
      }
      handleCloseModal();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to save expense');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(expenseToDelete);
      setExpenseToDelete(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete expense');
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
    <div data-testid="expenses-list-container" className="space-y-4">
      {/* Subheader */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Project Direct Expenses ({expenses.length})
            </h4>
            {expenses.length > 0 && (
              <span className="text-xs font-bold text-text-primary">
                • {formatMoney(totalExpenseAmount, currency)}
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted">
            Equipment rentals, transportation, permits, and miscellaneous project costs
          </p>
        </div>

        {!isForceClosed && (
          <button
            type="button"
            data-testid="add-expense-btn"
            onClick={handleOpenCreateModal}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-98"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record Expense</span>
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
        <div data-testid="expenses-loading" className="space-y-3">
          <div className="h-16 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
          <div className="h-16 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
        </div>
      )}

      {/* Query Error */}
      {error && !isLoading && (
        <div
          role="alert"
          data-testid="expenses-error"
          className="flex flex-col items-center justify-center rounded-xl border border-status-danger/25 bg-surface p-6 text-center"
        >
          <AlertCircle className="h-6 w-6 text-status-danger mb-1" />
          <h4 className="text-xs font-bold text-text-primary">Failed to load expenses</h4>
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
      {!isLoading && !error && expenses.length === 0 && (
        <div
          data-testid="expenses-empty-state"
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/30 p-8 text-center"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border text-text-muted shadow-2xs mb-2">
            <Receipt className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-text-primary">No project expenses recorded</h4>
          <p className="mt-1 max-w-xs text-[11px] text-text-muted">
            Track gear rental, vehicle fuel, permits, or studio booking fees for accurate profit
            margins.
          </p>
          {!isForceClosed && (
            <button
              type="button"
              data-testid="empty-add-expense-btn"
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary shadow-2xs hover:bg-surface-muted transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record First Expense</span>
            </button>
          )}
        </div>
      )}

      {/* Expenses List */}
      {!isLoading && !error && expenses.length > 0 && (
        <div data-testid="expenses-list" className="space-y-2.5">
          {expenses.map((e) => (
            <div
              key={e.id}
              data-testid={`expense-item-${e.id}`}
              className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-2xs transition-all hover:border-border-subtle"
            >
              {/* Left Info */}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-text-primary truncate">{e.label}</span>
                  {e.category && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-secondary border border-border-subtle">
                      <Tag className="h-3 w-3" />
                      {e.category}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                  <span className="flex items-center gap-1 text-text-muted">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(e.date)}
                  </span>
                  {e.notes && (
                    <span className="text-text-muted italic truncate max-w-xs">"{e.notes}"</span>
                  )}
                </div>
              </div>

              {/* Right: Amount & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center shrink-0">
                <p
                  data-testid={`expense-amount-${e.id}`}
                  className="text-sm sm:text-base font-bold text-text-primary"
                >
                  {formatMoney(e.amount, currency)}
                </p>

                {!isForceClosed && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      data-testid={`edit-expense-${e.id}-btn`}
                      onClick={() => handleOpenEditModal(e)}
                      title="Edit Expense"
                      aria-label="Edit expense"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      data-testid={`delete-expense-${e.id}-btn`}
                      onClick={() => setExpenseToDelete(e.id)}
                      title="Delete Expense"
                      aria-label="Delete expense"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-status-danger/20 bg-surface text-status-danger hover:bg-status-danger/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expense Form Modal */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={editingExpense}
        currency={currency}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      {expenseToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-expense-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-4">
            <h3 id="delete-expense-title" className="text-sm font-bold text-text-primary">
              Delete Project Expense?
            </h3>
            <p className="text-xs text-text-secondary">
              Are you sure you want to remove this expense record?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="cursor-pointer rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-delete-expense-btn"
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
