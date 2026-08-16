import React, { useState } from 'react';
import { Plus, Search, Copy, Edit2, Trash2, Workflow, Loader2, AlertCircle } from 'lucide-react';
import { useWorkflowTemplates } from '../hooks/useWorkflowTemplates';
import { useWorkflowTemplateMutations } from '../hooks/useWorkflowTemplateMutations';
import { WorkflowTemplateFormModal } from './WorkflowTemplateFormModal';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { FilterSegmentedControl } from '@/components/ui/filter-segmented-control';
import type { WorkflowTemplateWithStages } from '../types/workflowTemplateTypes';
import type { WorkflowTemplateFormData } from '../schemas/workflowTemplateSchemas';

interface WorkflowTemplatesListProps {
  workspaceId: string;
}

export const WorkflowTemplatesList: React.FC<WorkflowTemplatesListProps> = ({ workspaceId }) => {
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkflowTemplateWithStages | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: templates = [],
    isLoading,
    error,
  } = useWorkflowTemplates(workspaceId, !showArchived);

  const {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    isCreating,
    isUpdating,
    isDeleting,
    isDuplicating,
  } = useWorkflowTemplateMutations();

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
      t.workflow_template_stages.some((s) => s.label.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateSubmit = async (data: WorkflowTemplateFormData) => {
    await createTemplate({
      workspace_id: workspaceId,
      name: data.name,
      description: data.description,
      is_active: data.is_active,
      stages: data.stages.map((s, idx) => ({
        label: s.label,
        position: s.position ?? idx,
      })),
    });
  };

  const handleEditSubmit = async (data: WorkflowTemplateFormData) => {
    if (!editingTemplate) return;
    await updateTemplate({
      workspaceId,
      templateId: editingTemplate.id,
      input: {
        name: data.name,
        description: data.description,
        is_active: data.is_active,
        stages: data.stages.map((s, idx) => ({
          id: s.id,
          label: s.label,
          position: s.position ?? idx,
        })),
      },
    });
    setEditingTemplate(null);
  };

  const handleDeleteConfirm = async (templateId: string) => {
    await deleteTemplate({ workspaceId, templateId });
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary leading-tight">
            Workflow Templates
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage reusable production stage pipelines to standardize project workflows.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-subtle transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          <span>New Workflow Template</span>
        </button>
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates or stages..."
            className="w-full pl-9 pr-3.5 py-2 bg-surface border border-border hover:border-border-interactive focus:border-primary rounded-lg text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors shadow-xs"
          />
        </div>

        <FilterSegmentedControl
          options={[
            { id: 'active', label: 'Active' },
            { id: 'all', label: 'All (incl. inactive)' },
          ]}
          value={showArchived ? 'all' : 'active'}
          onChange={(val) => setShowArchived(val === 'all')}
          variant="pill"
          testIdPrefix="workflow-filter"
          className="self-start sm:self-auto"
        />
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-text-muted">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading workflow templates...
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-4 bg-status-danger-subtle border border-status-danger-border rounded-xl text-xs font-medium text-status-danger-text flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>Failed to load workflow templates. Please try again.</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredTemplates.length === 0 && (
        <EmptyState
          icon={Workflow}
          title={search ? 'No workflow templates match your search' : 'No workflow templates yet'}
          description={
            search
              ? 'Try adjusting your search query or switching to show all templates.'
              : 'Create reusable production workflows (e.g. Wedding Standard, Corporate Video) that can be applied to new projects in one click.'
          }
          variant="page"
          action={
            !search ? (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-subtle hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Create First Template</span>
              </button>
            ) : undefined
          }
        />
      )}

      {/* Templates Grid */}
      {!isLoading && !error && filteredTemplates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="flex flex-col justify-between p-5 bg-surface border border-border hover:border-border-interactive rounded-xl transition-all shadow-subtle group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-text-primary">{template.name}</h3>
                    {!template.is_active && <StatusBadge variant="archived" label="Inactive" />}
                  </div>
                  <span className="text-xs font-mono font-medium text-text-muted shrink-0 tabular-nums">
                    {template.workflow_template_stages.length} stages
                  </span>
                </div>

                {template.description && (
                  <p className="text-xs text-text-secondary line-clamp-2">{template.description}</p>
                )}

                {/* Stage Steps Preview */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Pipeline Stages:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {template.workflow_template_stages.map((stage, idx) => (
                      <div
                        key={stage.id || idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-text-primary bg-surface-muted border border-border-subtle rounded-md"
                      >
                        <span className="w-4 h-4 rounded-full bg-surface border border-border text-[10px] font-mono flex items-center justify-center text-text-secondary">
                          {idx + 1}
                        </span>
                        <span>{stage.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-border-subtle">
                <button
                  type="button"
                  disabled={isDuplicating}
                  onClick={() => duplicateTemplate({ workspaceId, templateId: template.id })}
                  aria-label={`Duplicate ${template.name}`}
                  className="inline-flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTemplate(template)}
                  aria-label={`Edit ${template.name}`}
                  className="inline-flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-primary-text hover:bg-primary-subtle rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(template.id)}
                  aria-label={`Delete ${template.name}`}
                  className="inline-flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-status-danger-text hover:bg-status-danger-subtle rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <WorkflowTemplateFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={isCreating}
      />

      {/* Edit Modal */}
      <WorkflowTemplateFormModal
        isOpen={Boolean(editingTemplate)}
        onClose={() => setEditingTemplate(null)}
        onSubmit={handleEditSubmit}
        initialData={editingTemplate}
        isSubmitting={isUpdating}
      />

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md p-6 bg-surface border border-border rounded-xl shadow-sheet space-y-4">
            <h3 className="text-base font-semibold text-text-primary">Delete Workflow Template?</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to delete this template? Historical project workflow stages
              created from this template will <strong className="text-text-primary">not</strong> be
              affected.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteConfirm(deletingId)}
                className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-status-danger hover:bg-status-danger/90 disabled:opacity-50 rounded-lg transition-colors"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
