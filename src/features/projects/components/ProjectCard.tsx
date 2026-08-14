import React from 'react';
import { useNavigate } from 'react-router';
import { User, Hash } from 'lucide-react';
import type { ProjectWithClient } from '../types/projectTypes';
import { ProjectStatusBadge } from './ProjectStatusBadge';

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
      className="group flex flex-col justify-between rounded-[var(--radius-card)] border border-border bg-surface p-4 transition-colors duration-[var(--transition-normal)] hover:border-border-interactive hover:bg-surface-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
    >
      <div className="space-y-2.5">
        {/* Top bar: Status + Number */}
        <div className="flex items-center justify-between gap-2">
          <ProjectStatusBadge status={project.status} />
          {project.project_number && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted tabular-nums">
              <Hash className="h-3 w-3" />
              {project.project_number}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-text-primary transition-colors group-hover:text-primary truncate">
          {project.title}
        </h3>

        {/* Client — inline, no bordered sub-container */}
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <User className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <span className="font-medium truncate">
            {project.client?.display_name || 'Unassigned'}
          </span>
          {project.client?.client_type && (
            <span className="ml-auto rounded-[var(--radius-badge)] bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium capitalize text-text-secondary">
              {project.client.client_type}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
