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
          style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: Camera,
        };
      case 'meeting':
        return {
          label: 'Meeting',
          style: 'bg-purple-50 text-purple-800 border-purple-200',
          icon: Users,
        };
      case 'pre_production':
        return {
          label: 'Pre-Production',
          style: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: Clapperboard,
        };
      case 'event_day':
        return {
          label: 'Event Day',
          style: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: CalendarCheck,
        };
      case 'custom':
      default:
        return {
          label: customLabel || 'Custom',
          style: 'bg-zinc-100 text-zinc-800 border-zinc-300',
          icon: Tag,
        };
    }
  };

  const { label, style, icon: Icon } = getBadgeConfig();

  return (
    <span
      data-testid={`session-type-${type}`}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${style} ${className}`}
    >
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </span>
  );
};
