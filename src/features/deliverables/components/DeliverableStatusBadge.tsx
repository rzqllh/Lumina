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
          style: 'bg-surface-muted text-text-secondary border-border',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          style: 'bg-primary-subtle text-primary-text border-primary-border',
        };
      case 'delivered':
        return {
          label: 'Delivered',
          style: 'bg-status-info-subtle text-status-info-text border-status-info-border',
        };
      case 'awaiting_review':
        return {
          label: 'Awaiting Review',
          style: 'bg-status-warning-subtle text-status-warning-text border-status-warning-border',
        };
      case 'approved':
        return {
          label: 'Approved',
          style:
            'bg-status-success-subtle text-status-success-text border-status-success-border font-semibold',
        };
      case 'revision_requested':
        return {
          label: 'Revision Requested',
          style: 'bg-status-danger-subtle text-status-danger-text border-status-danger-border',
        };
      default:
        return {
          label: status,
          style: 'bg-surface-muted text-text-secondary border-border',
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
