import React from 'react';
import { useNavigate } from 'react-router';
import { Briefcase, User, ArrowRight, Plus } from 'lucide-react';
import { ProjectStatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import type { Project } from '@/features/projects';

/**
 * DASH-005 — ActiveProjectsGrid
 * Shows existing truth only: project title, client, status, project_number.
 * No fake completion %, no fixed stage progression, no extra decorative query.
 * Prefer compact operational rows for faster scanning.
 */

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
      <div className="h-40 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
    );
  }

  return (
    <div data-testid="active-projects-panel" className="surface-level-2 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-primary-subtle text-primary-text border-primary-border">
            <Briefcase className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary tracking-tight">
              Active Projects
            </h2>
            <p className="text-xs text-text-secondary">{projects.length} in pipeline</p>
          </div>
        </div>

        <button
          type="button"
          data-testid="view-all-projects-btn"
          onClick={() => navigate('/projects')}
          className="text-xs font-semibold text-primary-text cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1"
          style={{ transition: `color var(--duration-fast) var(--ease-standard)` }}
        >
          View all →
        </button>
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="mt-4">
          <EmptyState
            icon={Briefcase}
            title="No active projects"
            description="Create a project to start tracking production milestones."
            variant="section"
            testId="active-projects-empty-state"
            action={
              <button
                type="button"
                data-testid="empty-create-project-btn"
                onClick={() => navigate('/projects/new')}
                className="inline-flex items-center gap-1.5 rounded-md border border-transparent bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground cursor-pointer"
                style={{
                  transition: `background-color var(--duration-fast)`,
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                Create Project
              </button>
            }
          />
        </div>
      )}

      {/* Projects list — compact operational rows for desktop, 2-col for wide */}
      {projects.length > 0 && (
        <div
          data-testid="active-projects-list"
          className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5"
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
              className="group flex flex-col justify-between rounded-lg border border-border-subtle bg-surface-muted/30 p-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring space-y-2"
              style={{
                transition: `border-color var(--duration-fast), background-color var(--duration-fast)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-interactive)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                e.currentTarget.style.backgroundColor = 'oklch(0.945 0.008 280 / 0.3)';
              }}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <ProjectStatusBadge status={p.status} />
                  {p.project_number && (
                    <span className="text-[11px] font-mono font-medium text-text-muted tabular-nums">
                      {p.project_number}
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-semibold text-text-primary truncate">{p.title}</h3>

                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <User className="h-3 w-3 text-text-muted shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{p.client?.display_name || 'Unassigned'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-1 border-t border-border-subtle">
                <ArrowRight
                  className="h-3.5 w-3.5 text-text-muted"
                  strokeWidth={1.75}
                  aria-hidden="true"
                  style={{ transition: `color var(--duration-fast)` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
