import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { ProjectForm, useProjectMutations, type ProjectFormValues } from '@/features/projects';

export function ProjectNewRoute() {
  const navigate = useNavigate();
  const { createProject } = useProjectMutations();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: ProjectFormValues) => {
    try {
      setError(null);
      const newProject = await createProject.mutateAsync({
        client_id: values.client_id,
        title: values.title,
        project_number: values.project_number || null,
        status: values.status,
        currency: values.currency,
      });

      navigate(`/projects/${newProject.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/projects')}
          aria-label="Back to projects"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Create New Project</h1>
          <p className="text-xs text-text-secondary">
            Initialize a project record linked to a client.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-7">
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/projects')}
          isSubmitting={createProject.isPending}
          serverError={error}
          submitLabel="Create Project"
        />
      </div>
    </div>
  );
}
