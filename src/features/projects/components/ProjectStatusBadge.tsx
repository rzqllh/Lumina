import React from 'react';
import type { ProjectStatus } from '../types/projectTypes';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'draft':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'closed':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'force_closed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'archived':
      default:
        return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'draft':
        return 'Draft';
      case 'closed':
        return 'Closed';
      case 'force_closed':
        return 'Force Closed';
      case 'archived':
        return 'Archived';
    }
  };

  return (
    <span
      data-testid={`project-status-${status}`}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getBadgeStyle()} ${className}`}
    >
      {getLabel()}
    </span>
  );
};
