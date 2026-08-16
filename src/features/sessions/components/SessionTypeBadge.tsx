import React from 'react';
import { Camera, Users, Clapperboard, CalendarCheck, Tag } from 'lucide-react';
import type { SessionType } from '../types';

interface SessionTypeBadgeProps {
  type: SessionType;
  customLabel?: string | null;
  className?: string;
}

export const SessionTypeBadge: React.FC<SessionTypeBadgeProps> = ({
  type,
  customLabel,
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'shoot':
        return {
          label: 'Shoot',
          style: 'bg-status-success-subtle text-status-success-text border-status-success-border',
          icon: Camera,
        };
      case 'meeting':
        return {
          label: 'Meeting',
          style: 'bg-primary-subtle text-primary-text border-primary-border',
          icon: Users,
        };
      case 'pre_production':
        return {
          label: 'Pre-Production',
          style: 'bg-status-info-subtle text-status-info-text border-status-info-border',
          icon: Clapperboard,
        };
      case 'event_day':
        return {
          label: 'Event Day',
          style: 'bg-status-warning-subtle text-status-warning-text border-status-warning-border',
          icon: CalendarCheck,
        };
      case 'custom':
      default:
        return {
          label: customLabel || 'Custom',
          style: 'bg-surface-muted text-text-secondary border-border-subtle',
          icon: Tag,
        };
    }
  };

  const { label, style, icon: Icon } = getBadgeConfig();

  return (
    <span
      data-testid={`session-type-${type}`}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${style} ${className}`}
    >
      <Icon className="h-3 w-3" strokeWidth={1.75} />
      <span>{label}</span>
    </span>
  );
};
