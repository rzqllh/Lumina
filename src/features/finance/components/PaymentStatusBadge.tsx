import React from 'react';
import type { PaymentStatus, TemporalPaymentCondition } from '../types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  dueDate: string; // YYYY-MM-DD
  className?: string;
}

function computeTemporalCondition(
  status: PaymentStatus,
  dueDateStr: string
): TemporalPaymentCondition {
  if (status === 'paid') return 'paid';

  const today = new Date().toISOString().split('T')[0];
  if (dueDateStr < today) return 'overdue';
  if (dueDateStr === today) return 'due_today';
  return 'upcoming';
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  dueDate,
  className = '',
}) => {
  const condition = computeTemporalCondition(status, dueDate);

  const getConfig = () => {
    switch (condition) {
      case 'paid':
        return {
          label: 'Paid',
          style: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
        };
      case 'overdue':
        return {
          label: 'Overdue',
          style: 'bg-rose-50 text-rose-800 border-rose-200 font-bold',
        };
      case 'due_today':
        return {
          label: 'Due Today',
          style: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold animate-pulse',
        };
      case 'upcoming':
      default:
        return {
          label: 'Upcoming',
          style: 'bg-zinc-100 text-zinc-800 border-zinc-300',
        };
    }
  };

  const { label, style } = getConfig();

  return (
    <span
      data-testid={`payment-status-${condition}`}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${style} ${className}`}
    >
      {label}
    </span>
  );
};
