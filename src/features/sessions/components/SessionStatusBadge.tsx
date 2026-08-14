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
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-zinc-100 text-zinc-500 border-zinc-200 line-through opacity-80';
      default:
        return 'bg-zinc-100 text-zinc-600 border-zinc-200';
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
