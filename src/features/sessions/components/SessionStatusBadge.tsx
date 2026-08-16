import React from 'react';
import type { SessionStatus } from '../types';

interface SessionStatusBadgeProps {
  status: SessionStatus;
  className?: string;
}

export const SessionStatusBadge: React.FC<SessionStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'scheduled':
        return 'bg-status-info-subtle text-status-info-text border-status-info-border';
      case 'completed':
        return 'bg-status-success-subtle text-status-success-text border-status-success-border';
      case 'cancelled':
        return 'bg-surface-muted text-text-muted border-border-subtle line-through opacity-80';
      default:
        return 'bg-surface-muted text-text-secondary border-border-subtle';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <span
      data-testid={`session-status-${status}`}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getBadgeStyle()} ${className}`}
    >
      {getLabel()}
    </span>
  );
};
