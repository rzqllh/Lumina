import React from 'react';
import type { ClientType } from '../types/clientTypes';

interface ClientTypeBadgeProps {
  type: ClientType;
  customLabel?: string | null;
  className?: string;
}

export const ClientTypeBadge: React.FC<ClientTypeBadgeProps> = ({
  type,
  customLabel,
  className = '',
}) => {
  const getBadgeStyle = () => {
    switch (type) {
      case 'couple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'organization':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'individual':
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
      case 'custom':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getLabel = () => {
    if (type === 'custom' && customLabel) {
      return customLabel;
    }
    switch (type) {
      case 'couple':
        return 'Couple';
      case 'organization':
        return 'Organization';
      case 'individual':
        return 'Individual';
      case 'custom':
        return 'Custom';
    }
  };

  return (
    <span
      data-testid="client-type-badge"
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getBadgeStyle()} ${className}`}
    >
      {getLabel()}
    </span>
  );
};
