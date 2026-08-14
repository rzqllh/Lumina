import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Edit2, User, Hash, Coins, Calendar, AlertCircle } from 'lucide-react';
import { useProject, ProjectStatusBadge } from '@/features/projects';
import { ProjectPricingSection } from '@/features/project-pricing';
import {
  ProjectWorkflowSection,
  ProjectTasksSection,
  useProjectStages,
} from '@/features/project-workflow';
import { ProjectSessionsSection } from '@/features/sessions';
import { ProjectDeliverablesSection } from '@/features/deliverables';
import { ProjectFinancialsSection, ProjectClosureControl } from '@/features/finance';
import { ProjectBriefSection } from '@/features/briefs';
import { ProjectFilesSection } from '@/features/files';

export function ProjectDetailRoute() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const { data: project, isLoading, error, refetch } = useProject(projectId);
  const { data: stages = [] } = useProjectStages(project?.workspace_id || '', project?.id || '');

  if (isLoading) {
    return (
      <div data-testid="project-detail-loading" className="space-y-6">
        <div className="h-28 animate-pulse rounded-2xl border border-border bg-surface-muted/60" />
        <div className="h-48 animate-pulse rounded-2xl border border-border bg-surface-muted/60" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div
        role="alert"
        data-testid="project-detail-error"
        className="flex flex-col items-center justify-center rounded-2xl border border-status-danger/25 bg-surface p-8 text-center"
      >
        <AlertCircle className="h-8 w-8 text-status-danger mb-2" />
        <h3 className="text-sm font-bold text-text-primary">Project not found</h3>
        <p className="mt-1 text-xs text-text-secondary max-w-sm">
          {error?.message || 'The requested project could not be loaded.'}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted"
          >
            Back to Projects
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isForceClosed = project.status === 'force_closed';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="back-to-projects-btn"
            onClick={() => navigate('/projects')}
            aria-label="Back to projects"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
              {project.title}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <ProjectStatusBadge status={project.status} />
              {project.project_number && (
                <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-secondary border border-border-subtle">
                  <Hash className="h-3 w-3" />
                  {project.project_number}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          data-testid="edit-project-btn"
          onClick={() => navigate(`/projects/${project.id}/edit`)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Edit2 className="h-3.5 w-3.5" />
          <span>Edit Project</span>
        </button>
      </div>

      {/* Project Completion & Lifecycle Gate (Feature #9) */}
      <ProjectClosureControl project={project} />

      {/* Overview Metadata Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Linked Client Card */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs sm:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Client Engagement
            </h2>
            {project.client?.id && (
              <button
                type="button"
                onClick={() => navigate(`/clients/${project.client.id}`)}
                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                View Client Profile →
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-primary border border-purple-200">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                {project.client?.display_name || 'Unassigned Client'}
              </h3>
              <p className="text-xs text-text-secondary capitalize">
                {project.client?.client_type} Client
                {project.client?.email ? ` • ${project.client.email}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Currency & Timing Card */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
            Settings & Specs
          </h2>
          <div className="space-y-2 text-xs text-text-secondary">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-text-muted">
                <Coins className="h-3.5 w-3.5" /> Currency
              </span>
              <span className="font-semibold text-text-primary">{project.currency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-text-muted">
                <Calendar className="h-3.5 w-3.5" /> Created
              </span>
              <span className="font-semibold text-text-primary">
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Pricing & Services (Feature #5) */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <ProjectPricingSection projectId={project.id} />
      </div>

      {/* Financial Health, Payments, Expenses & Crew (Feature #9) */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <ProjectFinancialsSection
          workspaceId={project.workspace_id}
          projectId={project.id}
          currency={project.currency}
          isForceClosed={isForceClosed}
        />
      </div>

      {/* Production Sessions (Feature #7) */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <ProjectSessionsSection
          workspaceId={project.workspace_id}
          projectId={project.id}
          isForceClosed={isForceClosed}
        />
      </div>

      {/* Promised Deliverables & Revisions (Feature #8) */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <ProjectDeliverablesSection
          workspaceId={project.workspace_id}
          projectId={project.id}
          isForceClosed={isForceClosed}
        />
      </div>

      {/* Creative Brief & Client Intake (Feature #11) */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <ProjectBriefSection workspaceId={project.workspace_id} projectId={project.id} />
      </div>

      {/* External Files, Google Drive & Client Portal (Feature #12) */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <ProjectFilesSection
          workspaceId={project.workspace_id}
          projectId={project.id}
          isForceClosed={isForceClosed}
        />
      </div>

      {/* Production Workflow & Stages (Feature #6) */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <ProjectWorkflowSection
          workspaceId={project.workspace_id}
          projectId={project.id}
          isForceClosed={isForceClosed}
          selectedStageId={selectedStageId}
          onSelectStage={setSelectedStageId}
        />
        <ProjectTasksSection
          workspaceId={project.workspace_id}
          projectId={project.id}
          stages={stages}
          isForceClosed={isForceClosed}
          selectedStageId={selectedStageId}
          onSelectStage={setSelectedStageId}
        />
      </div>
    </div>
  );
}
