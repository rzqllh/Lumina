import React, { useState } from 'react';
import { Plus, Search, Copy, Edit2, Trash2, Workflow, Loader2 } from 'lucide-react';
import { useWorkflowTemplates } from '../hooks/useWorkflowTemplates';
import { useWorkflowTemplateMutations } from '../hooks/useWorkflowTemplateMutations';
import { WorkflowTemplateFormModal } from './WorkflowTemplateFormModal';
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
      {/* Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates or stages..."
              className="w-full pl-9 pr-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-neutral-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-amber-500/30"
            />
            Include inactive
          </label>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Workflow Template
        </button>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-neutral-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading workflow templates...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-sm text-red-300">
          Failed to load workflow templates. Please try again.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-neutral-900/30 border border-neutral-800 border-dashed rounded-xl text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
            <Workflow className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-neutral-100 mb-1">
            {search ? 'No workflow templates match your search' : 'No workflow templates yet'}
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mb-4">
            Create reusable production workflows (e.g. Wedding Standard, Corporate Video) that can
            be applied to new projects in one click.
          </p>
          {!search && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Template
            </button>
          )}
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && !error && filteredTemplates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="flex flex-col justify-between p-5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-xl transition-all shadow-sm group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-100">{template.name}</h3>
                    {!template.is_active && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold text-neutral-400 bg-neutral-800 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-neutral-400 shrink-0">
                    {template.workflow_template_stages.length} stages
                  </span>
                </div>

                {template.description && (
                  <p className="text-xs text-neutral-400 mb-4 line-clamp-2">
                    {template.description}
                  </p>
                )}

                {/* Stage Steps Preview */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Pipeline Stages:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {template.workflow_template_stages.map((stage, idx) => (
                      <div
                        key={stage.id || idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 bg-neutral-950 border border-neutral-800 rounded-md"
                      >
                        <span className="w-4 h-4 rounded-full bg-neutral-800 text-[10px] font-mono flex items-center justify-center text-neutral-400">
                          {idx + 1}
                        </span>
                        <span>{stage.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800/80">
                <button
                  type="button"
                  disabled={isDuplicating}
                  onClick={() => duplicateTemplate({ workspaceId, templateId: template.id })}
                  aria-label={`Duplicate ${template.name}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTemplate(template)}
                  aria-label={`Edit ${template.name}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(template.id)}
                  aria-label={`Delete ${template.name}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md p-6 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-100">Delete Workflow Template?</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to delete this template? Historical project workflow stages
              created from this template will <strong className="text-neutral-200">not</strong> be
              affected.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteConfirm(deletingId)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-lg transition-colors"
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
