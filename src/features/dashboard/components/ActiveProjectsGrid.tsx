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
      <div className="h-44 animate-pulse rounded-2xl border border-border/60 bg-surface-muted/40" />
    );
  }

  return (
    <div
      data-testid="active-projects-panel"
      className="rounded-2xl border border-border/80 bg-surface p-5 shadow-2xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-tight">
              Active Projects
            </h3>
            <p className="text-xs text-text-secondary">{projects.length} in pipeline</p>
          </div>
        </div>

        <button
          type="button"
          data-testid="view-all-projects-btn"
          onClick={() => navigate('/projects')}
          className="text-xs font-semibold text-primary hover:text-primary/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1 transition-colors"
        >
          View all →
        </button>
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div
          data-testid="active-projects-empty-state"
          className="mt-4 text-center py-6 rounded-xl bg-surface-muted/20 border border-border-subtle"
        >
          <Briefcase className="h-6 w-6 text-text-muted mx-auto mb-2" />
          <p className="text-xs font-semibold text-text-primary">No active projects</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            Create a project to start tracking production milestones.
          </p>
          <button
            type="button"
            data-testid="empty-create-project-btn"
            onClick={() => navigate('/projects/new')}
            className="mt-3.5 inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Project</span>
          </button>
        </div>
      )}

      {/* Projects List — Refined scannable cards */}
      {projects.length > 0 && (
        <div
          data-testid="active-projects-list"
          className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
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
              className="group flex flex-col justify-between rounded-xl border border-border/70 bg-surface-muted/20 p-3.5 transition-all duration-[var(--transition-fast)] hover:border-border-interactive hover:bg-surface-muted/50 hover:shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <ProjectStatusBadge status={p.status} />
                  {p.project_number && (
                    <span className="text-[11px] font-mono font-medium text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border-subtle tabular-nums">
                      {p.project_number}
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                  {p.title}
                </h4>

                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <User className="h-3 w-3 text-text-muted shrink-0" />
                  <span className="truncate">{p.client?.display_name || 'Unassigned'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end text-xs text-text-muted group-hover:text-primary transition-colors pt-1 border-t border-border-subtle/50">
                <span className="text-[11px] font-medium mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open project
                </span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
