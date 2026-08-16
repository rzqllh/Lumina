import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useWorkspace } from '@/lib/auth';
import { CollaboratorsList } from '@/features/finance';

export function CollaboratorsRoute() {
  const { workspaceId } = useWorkspace();
  const navigate = useNavigate();

  if (!workspaceId) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-xs text-text-muted">No active workspace selected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-testid="back-to-settings-btn"
          onClick={() => navigate('/settings')}
          aria-label="Back to settings"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <span className="text-xs font-semibold text-text-muted">Settings / Catalog</span>
      </div>

      <CollaboratorsList workspaceId={workspaceId} />
    </div>
  );
}
