import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useWorkspace } from '@/lib/auth';
import { WorkflowTemplatesList } from '@/features/workflow-templates';

export function WorkflowTemplatesRoute() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();

  if (!currentWorkspace) {
    return <div className="py-12 text-center text-text-muted">Workspace not loaded.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border-subtle pb-5">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          aria-label="Back to Settings"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary leading-tight">
            Workflow Templates
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage reusable production stage pipelines to standardize project workflows.
          </p>
        </div>
      </div>

      {/* Main List */}
      <WorkflowTemplatesList workspaceId={currentWorkspace.id} />
    </div>
  );
}
