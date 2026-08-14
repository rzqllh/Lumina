import React from 'react';
import { useNavigate } from 'react-router';
import { FolderKanban, User, Hash } from 'lucide-react';
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
      className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:border-primary/40 hover:bg-surface-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
    >
      <div>
        {/* Top bar: Title and Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-text-primary transition-colors group-hover:text-primary">
              {project.title}
            </h3>
            {project.project_number && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-text-secondary">
                <Hash className="h-3.5 w-3.5 text-text-muted" />
                {project.project_number}
              </span>
            )}
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>

        {/* Client association info */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-muted/60 p-2.5 text-xs text-text-secondary">
          <User className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <span className="font-semibold text-text-primary truncate">
            {project.client?.display_name || 'Unassigned Client'}
          </span>
          {project.client?.client_type && (
            <span className="ml-auto rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-semibold capitalize text-text-secondary border border-border">
              {project.client.client_type}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5 font-medium">
          <FolderKanban className="h-3.5 w-3.5 text-text-muted" />
          <span>Project Foundation</span>
        </div>
        <span className="text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Open workspace →
        </span>
      </div>
    </div>
  );
};
