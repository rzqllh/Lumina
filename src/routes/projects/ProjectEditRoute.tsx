import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import {
  useProject,
  useProjectMutations,
  ProjectForm,
  type ProjectFormValues,
} from '@/features/projects';

export function ProjectEditRoute() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading, error } = useProject(projectId);
  const { updateProject } = useProjectMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: ProjectFormValues) => {
    if (!projectId) return;
    try {
      setSubmitError(null);
      await updateProject.mutateAsync({
        projectId,
        input: {
          client_id: values.client_id,
          title: values.title,
          project_number: values.project_number || null,
          status: values.status,
          currency: values.currency,
        },
      });

      navigate(`/projects/${projectId}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update project');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-surface-muted/60" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center rounded-xl border border-status-danger-border bg-surface p-8 text-center"
      >
        <AlertCircle className="h-8 w-8 text-status-danger-text mb-2" strokeWidth={1.75} />
        <h3 className="text-base font-semibold text-text-primary">Project not found</h3>
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="mt-4 cursor-pointer rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 border-b border-border-subtle pb-5">
        <button
          type="button"
          onClick={() => navigate(`/projects/${projectId}`)}
          aria-label="Back to project detail"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Edit Project</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Update project specifications and system status.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle sm:p-7">
        <ProjectForm
          initialValues={{
            title: project.title,
            client_id: project.client_id,
            project_number: project.project_number,
            status: project.status,
            currency: project.currency,
          }}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/projects/${projectId}`)}
          isSubmitting={updateProject.isPending}
          serverError={submitError}
          submitLabel="Update Project"
          isEdit
        />
      </div>
    </div>
  );
}
