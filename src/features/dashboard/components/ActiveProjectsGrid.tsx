import React from 'react';
import { useNavigate } from 'react-router';
import { Briefcase, User, ArrowRight, Plus } from 'lucide-react';
import { ProjectStatusBadge } from '@/features/projects';
import type { Project } from '@/features/projects';

interface ActiveProjectsGridProps {
  projects: (Project & { client?: { display_name?: string } })[];
  isLoading?: boolean;
}

export const ActiveProjectsGrid: React.FC<ActiveProjectsGridProps> = ({
  projects,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="h-44 animate-pulse rounded-2xl border border-border bg-surface-muted/50" />
    );
  }

  return (
    <div
      data-testid="active-projects-panel"
      className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Active Projects</h3>
            <p className="text-xs text-text-secondary">{projects.length} in production pipeline</p>
          </div>
        </div>

        <button
          type="button"
          data-testid="view-all-projects-btn"
          onClick={() => navigate('/projects')}
          className="min-h-[36px] px-2 text-xs font-semibold text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
        >
          View all →
        </button>
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div
          data-testid="active-projects-empty-state"
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/30 p-6 text-center"
        >
          <Briefcase className="h-8 w-8 text-text-secondary mb-1.5" />
          <h4 className="text-xs font-bold text-text-primary">No active projects</h4>
          <p className="mt-0.5 max-w-xs text-xs text-text-secondary">
            Create a new client project to start tracking production milestones.
          </p>
          <button
            type="button"
            data-testid="empty-create-project-btn"
            onClick={() => navigate('/projects/new')}
            className="mt-3 inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-4 w-4" />
            <span>Create Project</span>
          </button>
        </div>
      )}

      {/* Projects List */}
      {projects.length > 0 && (
        <div data-testid="active-projects-list" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projects.slice(0, 6).map((p) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              data-testid={`active-project-card-${p.id}`}
              onClick={() => navigate(`/projects/${p.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/projects/${p.id}`);
                }
              }}
              className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 shadow-2xs transition-all hover:border-primary/40 hover:bg-surface-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer space-y-3"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <ProjectStatusBadge status={p.status} />
                  {p.project_number && (
                    <span className="text-xs font-semibold text-text-secondary">
                      {p.project_number}
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                  {p.title}
                </h4>

                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <User className="h-3.5 w-3.5 text-text-muted shrink-0" />
                  <span className="truncate">{p.client?.display_name || 'Unassigned Client'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border-subtle pt-2.5 text-xs font-medium text-text-secondary group-hover:text-primary">
                <span>Open Project Console</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform text-primary" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
