import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useWorkspace } from '@/lib/auth';
import { WorkflowTemplatesList } from '@/features/workflow-templates';

export function WorkflowTemplatesRoute() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();

  if (!currentWorkspace) {
    return <div className="py-12 text-center text-neutral-400">Workspace not loaded.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          aria-label="Back to Settings"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-100 sm:text-2xl">
            Workflow Templates
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage reusable production stage pipelines to standardize project workflows.
          </p>
        </div>
      </div>

      {/* Main List */}
      <WorkflowTemplatesList workspaceId={currentWorkspace.id} />
    </div>
  );
}
