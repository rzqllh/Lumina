import React from 'react';
import { useNavigate } from 'react-router';
import { User, Hash } from 'lucide-react';
import type { ProjectWithClient } from '../types/projectTypes';
import { ProjectStatusBadge } from './ProjectStatusBadge';

/**
 * PROJ-003 — ProjectCard
 * Canonical card using token-aligned styling.
 * Priority order: Status badge + number → Title → Client
 * No fabricated data. No completion %.
 */

interface ProjectCardProps {
  project: ProjectWithClient;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid={`project-card-${project.id}`}
      onClick={() => navigate(`/projects/${project.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/projects/${project.id}`);
        }
      }}
      className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        transition: `border-color var(--duration-fast) var(--ease-standard),
                     background-color var(--duration-fast) var(--ease-standard)`,
        borderRadius: 'var(--radius-xl)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-interactive)';
        e.currentTarget.style.backgroundColor = 'var(--color-surface-muted)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-default)';
        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
      }}
    >
      <div className="space-y-2.5">
        {/* Top bar: Status + Number */}
        <div className="flex items-center justify-between gap-2">
          <ProjectStatusBadge status={project.status} />
          {project.project_number && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted tabular-nums">
              <Hash className="h-3 w-3" strokeWidth={1.75} />
              {project.project_number}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-sm font-semibold text-text-primary truncate"
          style={{ transition: `color var(--duration-fast)` }}
        >
          {project.title}
        </h3>

        {/* Client */}
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <User className="h-3.5 w-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
          <span className="font-medium truncate">
            {project.client?.display_name || 'Unassigned'}
          </span>
          {project.client?.client_type && (
            <span className="ml-auto rounded-md border border-border-subtle bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium capitalize text-text-secondary">
              {project.client.client_type}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
