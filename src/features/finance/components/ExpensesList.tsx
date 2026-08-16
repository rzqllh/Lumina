import React, { useState } from 'react';
import { Calendar, Tag, Edit2, Trash2, Plus, AlertCircle, Receipt } from 'lucide-react';
import { ExpenseFormModal } from './ExpenseFormModal';
import { EmptyState } from '@/components/ui/empty-state';
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
      {/* List Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-text-primary">Direct Project Expenses</h4>
            {expenses.length > 0 && (
              <span className="text-xs text-text-secondary tabular-nums font-normal">
                (Total: {formatMoney(totalExpenseAmount, currency)})
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary">
            Production costs, equipment rentals, permits, and travel
          </p>
        </div>

        {!isForceClosed && (
          <button
            type="button"
            data-testid="add-expense-btn"
            onClick={handleOpenCreateModal}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Record Expense</span>
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
          className="flex flex-col items-center justify-center rounded-xl border border-status-danger-border bg-surface p-6 text-center"
        >
          <AlertCircle className="h-6 w-6 text-status-danger-text mb-1" strokeWidth={1.75} />
          <h4 className="text-xs font-semibold text-text-primary">Failed to load expenses</h4>
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
      {!isLoading && !error && expenses.length === 0 && (
        <div data-testid="expenses-empty-state">
          <EmptyState
            icon={Receipt}
            title="No project expenses logged"
            description="Log direct production costs like equipment rentals, travel, location permits, or props to accurately calculate profit margins."
            action={
              !isForceClosed ? (
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>Record First Expense</span>
                </button>
              ) : undefined
            }
          />
        </div>
      )}

      {/* Expenses List */}
      {!isLoading && !error && expenses.length > 0 && (
        <div data-testid="expenses-list" className="space-y-2.5">
          {expenses.map((e) => (
            <div
              key={e.id}
              data-testid={`expense-item-${e.id}`}
              className="group rounded-xl border border-border bg-surface p-4 shadow-2xs transition-all hover:border-border-subtle"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Left: Info */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{e.label}</span>
                    {e.category && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-secondary border border-border-subtle">
                        <Tag className="h-3 w-3 text-text-muted" strokeWidth={1.75} />
                        {e.category}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                    <span className="flex items-center gap-1.5 text-text-muted">
                      <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {formatDate(e.date)}
                    </span>
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
                    data-testid={`expense-amount-${e.id}`}
                    className="text-sm sm:text-base font-bold text-status-danger-text tabular-nums tracking-tight"
                  >
                    -{formatMoney(e.amount, currency)}
                  </span>

                  {!isForceClosed && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        data-testid={`edit-expense-btn-${e.id}`}
                        onClick={() => handleOpenEditModal(e)}
                        title="Edit Expense"
                        aria-label="Edit expense"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>

                      <button
                        type="button"
                        data-testid={`delete-expense-btn-${e.id}`}
                        onClick={() => setExpenseToDelete(e.id)}
                        title="Delete Expense"
                        aria-label="Delete expense"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-status-danger-border bg-surface text-status-danger-text hover:bg-status-danger-subtle transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  )}
                </div>
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
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-sheet space-y-4">
            <h3 id="delete-expense-title" className="text-base font-semibold text-text-primary">
              Delete Project Expense?
            </h3>
            <p className="text-xs text-text-secondary">
              Are you sure you want to remove this expense record?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-delete-expense-btn"
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
