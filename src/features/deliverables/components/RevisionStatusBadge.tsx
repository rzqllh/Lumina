import React from 'react';
import type { RevisionStatus } from '../types';

interface RevisionStatusBadgeProps {
  status: RevisionStatus;
  className?: string;
}

export const RevisionStatusBadge: React.FC<RevisionStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'requested':
        return {
          label: 'Requested',
          style: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'delivered':
        return {
          label: 'Delivered',
          style: 'bg-sky-50 text-sky-700 border-sky-200',
        };
      case 'awaiting_review':
        return {
          label: 'Awaiting Review',
          style: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'approved':
        return {
          label: 'Approved',
          style: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
        };
      case 'changes_requested':
        return {
          label: 'Changes Requested',
          style: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      default:
        return {
          label: status,
          style: 'bg-zinc-100 text-zinc-600 border-zinc-200',
        };
    }
  };

  const { label, style } = getBadgeConfig();

  return (
    <span
      data-testid={`revision-status-${status}`}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${style} ${className}`}
    >
      {label}
    </span>
  );
};
