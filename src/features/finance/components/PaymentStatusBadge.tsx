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
          style:
            'bg-status-success-subtle text-status-success-text border-status-success-border font-semibold',
        };
      case 'overdue':
        return {
          label: 'Overdue',
          style:
            'bg-status-danger-subtle text-status-danger-text border-status-danger-border font-semibold',
        };
      case 'due_today':
        return {
          label: 'Due Today',
          style:
            'bg-status-warning-subtle text-status-warning-text border-status-warning-border font-semibold',
        };
      case 'upcoming':
      default:
        return {
          label: 'Upcoming',
          style: 'bg-surface-muted text-text-secondary border-border',
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
