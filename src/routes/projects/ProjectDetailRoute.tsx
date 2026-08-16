import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Edit2,
  User,
  Hash,
  Coins,
  Calendar,
  AlertCircle,
  Layers,
  Clock,
  DollarSign,
  FileText,
  RefreshCw,
} from 'lucide-react';

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

type SectionTab = 'all' | 'workflow' | 'sessions' | 'finance' | 'files';

export function ProjectDetailRoute() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SectionTab>('workflow');

  const { data: project, isLoading, error, refetch } = useProject(projectId);
  const { data: stages = [] } = useProjectStages(project?.workspace_id || '', project?.id || '');

  if (isLoading) {
    return (
      <div data-testid="project-detail-loading" className="space-y-6">
        <div className="h-28 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
        <div className="h-48 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div
        role="alert"
        data-testid="project-detail-error"
        className="flex flex-col items-center justify-center rounded-xl border p-8 text-center bg-surface border-status-danger-border"
      >
        <AlertCircle className="h-7 w-7 text-status-danger-text mb-2" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-text-primary">Project not found</h3>
        <p className="mt-1 text-xs text-text-secondary max-w-sm">
          {error?.message || 'The requested project could not be loaded.'}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
          >
            Back to Projects
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isForceClosed = project.status === 'force_closed';

  const showWorkflow = activeTab === 'all' || activeTab === 'workflow';
  const showSessions = activeTab === 'all' || activeTab === 'sessions';
  const showFinance = activeTab === 'all' || activeTab === 'finance';
  const showFiles = activeTab === 'all' || activeTab === 'files';

  const tabs: { id: SectionTab; label: string; icon?: typeof Layers; testId: string }[] = [
    { id: 'all', label: 'All Overview', testId: 'tab-all-sections' },
    { id: 'workflow', label: 'Workflow & Tasks', icon: Layers, testId: 'tab-workflow' },
    { id: 'sessions', label: 'Sessions & Deliverables', icon: Clock, testId: 'tab-sessions' },
    { id: 'finance', label: 'Pricing & Finance', icon: DollarSign, testId: 'tab-finance' },
    { id: 'files', label: 'Brief & Files', icon: FileText, testId: 'tab-files' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-subtle pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="back-to-projects-btn"
            onClick={() => navigate('/projects')}
            aria-label="Back to projects"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary leading-tight">
              {project.title}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <ProjectStatusBadge status={project.status} />
              {project.project_number && (
                <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-xs font-mono font-medium text-text-secondary border border-border-subtle tabular-nums">
                  <Hash className="h-3 w-3" strokeWidth={1.75} />
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
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring self-start sm:self-auto"
        >
          <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Edit Project</span>
        </button>
      </div>

      {/* Project Completion & Lifecycle Gate (Feature #9) */}
      <ProjectClosureControl project={project} />

      {/* Overview Metadata Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Linked Client Card */}
        <div className="surface-level-2 p-5 sm:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Client Engagement
            </h2>
            {project.client?.id && (
              <button
                type="button"
                onClick={() => navigate(`/clients/${project.client.id}`)}
                className="text-xs font-semibold text-primary-text hover:underline cursor-pointer"
              >
                View Client Profile →
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-primary-subtle text-primary-text border-primary-border">
              <User className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-text-primary truncate">
                {project.client?.display_name || 'Unassigned Client'}
              </h3>
              <p className="text-xs text-text-secondary capitalize truncate">
                {project.client?.client_type} Client
                {project.client?.email ? ` · ${project.client.email}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Currency & Timing Card */}
        <div className="surface-level-2 p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Settings & Specs
          </h2>
          <div className="space-y-2 text-xs text-text-secondary">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-text-muted">
                <Coins className="h-3.5 w-3.5" strokeWidth={1.75} /> Currency
              </span>
              <span className="font-semibold text-text-primary tabular-nums">
                {project.currency}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-text-muted">
                <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} /> Created
              </span>
              <span className="font-semibold text-text-primary tabular-nums">
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation Tabs for Progressive Disclosure */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-border-subtle">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={tab.testId}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-subtle'
                  : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
              ].join(' ')}
            >
              {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Operational Flow: Production Workflow & Stages */}
      {showWorkflow && (
        <div className="surface-level-2 p-5 space-y-5">
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
      )}

      {/* Production Sessions */}
      {showSessions && (
        <div className="surface-level-2 p-5">
          <ProjectSessionsSection
            workspaceId={project.workspace_id}
            projectId={project.id}
            isForceClosed={isForceClosed}
          />
        </div>
      )}

      {/* Promised Deliverables & Revisions */}
      {showSessions && (
        <div className="surface-level-2 p-5">
          <ProjectDeliverablesSection
            workspaceId={project.workspace_id}
            projectId={project.id}
            isForceClosed={isForceClosed}
          />
        </div>
      )}

      {/* Commercial Pricing & Services */}
      {showFinance && (
        <div className="surface-level-2 p-5">
          <ProjectPricingSection projectId={project.id} />
        </div>
      )}

      {/* Financial Health, Payments, Expenses & Crew */}
      {showFinance && (
        <div className="surface-level-2 p-5">
          <ProjectFinancialsSection
            workspaceId={project.workspace_id}
            projectId={project.id}
            currency={project.currency}
            isForceClosed={isForceClosed}
          />
        </div>
      )}

      {/* Creative Brief & Client Intake */}
      {showFiles && (
        <div className="surface-level-2 p-5">
          <ProjectBriefSection workspaceId={project.workspace_id} projectId={project.id} />
        </div>
      )}

      {/* External Files, Google Drive & Client Portal */}
      {showFiles && (
        <div className="surface-level-2 p-5">
          <ProjectFilesSection
            workspaceId={project.workspace_id}
            projectId={project.id}
            isForceClosed={isForceClosed}
          />
        </div>
      )}
    </div>
  );
}
