import React from 'react';
import { StatusBadge } from '@/components/ui/status-badge';
import type { StatusVariant } from '@/components/ui/status-badge';
import type { ClientType } from '../types/clientTypes';

/**
 * ClientTypeBadge — uses canonical G-005 StatusBadge.
 * Maps client types to semantic OKLCH status tokens.
 * No raw Tailwind color classes (purple-50, blue-50, etc.)
 */

interface ClientTypeBadgeProps {
  type: ClientType;
  customLabel?: string | null;
  className?: string;
}

const typeVariantFixed: Record<string, StatusVariant> = {
  couple: 'info',
  organization: 'info',
  individual: 'neutral',
  custom: 'warning',
};

export const ClientTypeBadge: React.FC<ClientTypeBadgeProps> = ({
  type,
  customLabel,
  className,
}) => {
  const label =
    type === 'custom' && customLabel
      ? customLabel
      : ({
          couple: 'Couple',
          organization: 'Organization',
          individual: 'Individual',
          custom: 'Custom',
        }[type] ?? type);

  const variant = typeVariantFixed[type] ?? 'neutral';

  return (
    <StatusBadge
      data-testid="client-type-badge"
      variant={variant}
      label={label}
      className={className}
    />
  );
};
