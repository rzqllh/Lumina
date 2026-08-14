import React from 'react';
import type { DeliverableStatus } from '../types';

interface DeliverableStatusBadgeProps {
  status: DeliverableStatus;
  className?: string;
}

export const DeliverableStatusBadge: React.FC<DeliverableStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'planned':
        return {
          label: 'Planned',
          style: 'bg-zinc-100 text-zinc-700 border-zinc-300',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          style: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
      case 'delivered':
        return {
          label: 'Delivered',
          style: 'bg-sky-50 text-sky-800 border-sky-200',
        };
      case 'awaiting_review':
        return {
          label: 'Awaiting Review',
          style: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'approved':
        return {
          label: 'Approved',
          style: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
        };
      case 'revision_requested':
        return {
          label: 'Revision Requested',
          style: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      default:
        return {
          label: status,
          style: 'bg-zinc-100 text-zinc-700 border-zinc-300',
        };
    }
  };

  const { label, style } = getBadgeConfig();

  return (
    <span
      data-testid={`deliverable-status-${status}`}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${style} ${className}`}
    >
      {label}
    </span>
  );
};
