import { NavLink } from 'react-router';
import { Sparkles, Package, Workflow, Users } from 'lucide-react';
import { useWorkspace } from '@/lib/auth';
import { WorkflowTemplatesList } from '@/features/workflow-templates';

export function WorkflowTemplatesRoute() {
  const { currentWorkspace } = useWorkspace();

  if (!currentWorkspace) {
    return <div className="py-12 text-center text-text-muted">Workspace not loaded.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs across Catalog & Template items */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3 overflow-x-auto">
        <NavLink
          to="/services"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Services</span>
        </NavLink>
        <NavLink
          to="/packages"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors shrink-0"
        >
          <Package className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Packages</span>
        </NavLink>
        <NavLink
          to="/workflows"
          className="flex items-center gap-1.5 rounded-lg bg-surface-muted px-3 py-1.5 text-xs font-semibold text-text-primary shadow-subtle border border-border shrink-0"
        >
          <Workflow className="h-3.5 w-3.5 text-primary-text" strokeWidth={1.75} />
          <span>Workflow Templates</span>
        </NavLink>
        <NavLink
          to="/settings/collaborators"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors shrink-0"
        >
          <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Crew & Collaborators</span>
        </NavLink>
      </div>

      {/* Main List */}
      <WorkflowTemplatesList workspaceId={currentWorkspace.id} />
    </div>
  );
}
