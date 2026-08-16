import React, { useState } from 'react';
import { X, Sparkles, Loader2, Workflow, Check } from 'lucide-react';
import { useWorkflowTemplates } from '@/features/workflow-templates';
import { ContextHelp } from '@/components/ui/context-help';

interface ApplyWorkflowTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  projectId: string;
  hasExistingStages: boolean;
  onApply: (templateId: string, mode: 'replace' | 'append') => Promise<void>;
  isApplying?: boolean;
}

export const ApplyWorkflowTemplateModal: React.FC<ApplyWorkflowTemplateModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  hasExistingStages,
  onApply,
  isApplying = false,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [mode, setMode] = useState<'replace' | 'append'>(hasExistingStages ? 'append' : 'replace');

  const { data: templates = [], isLoading, error } = useWorkflowTemplates(workspaceId, true);

  React.useEffect(() => {
    if (isOpen) {
      if (templates.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(templates[0].id);
      }
      setMode(hasExistingStages ? 'append' : 'replace');
    }
  }, [isOpen, templates, hasExistingStages, selectedTemplateId]);

  if (!isOpen) return null;

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const handleApplySubmit = async () => {
    if (!selectedTemplateId) return;
    await onApply(selectedTemplateId, mode);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-template-title"
    >
      <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-surface border border-border rounded-xl shadow-sheet overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-subtle border border-primary-border flex items-center justify-center text-primary-text">
              <Sparkles className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 id="apply-template-title" className="text-base font-semibold text-text-primary">
                  Apply Workflow Template
                </h2>
                <ContextHelp
                  title="Workflow Template Snapshot"
                  description="Applying a template clones blueprint stages into project-owned workflow stages. You can customize, reorder, or skip stages independently."
                  guideAnchor="#workflow-tasks"
                  testId="workflow-modal-context-help"
                />
              </div>
              <p className="text-xs text-text-secondary">
                Snapshot preset stages directly into this project.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-text-muted">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading workflow templates...
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-status-danger-subtle border border-status-danger-border rounded-lg text-xs font-medium text-status-danger-text">
              Failed to load workflow templates.
            </div>
          )}

          {!isLoading && !error && templates.length === 0 && (
            <div className="text-center py-10 px-4 bg-surface-muted/50 border border-border rounded-xl">
              <Workflow className="w-8 h-8 text-text-muted mx-auto mb-2" strokeWidth={1.75} />
              <p className="text-sm font-semibold text-text-primary mb-1">
                No active workflow templates
              </p>
              <p className="text-xs text-text-secondary">
                Create templates in the Catalog to apply them here.
              </p>
            </div>
          )}

          {!isLoading && templates.length > 0 && (
            <>
              {/* Template Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Select Template:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {templates.map((tmpl) => {
                    const isSelected = tmpl.id === selectedTemplateId;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => setSelectedTemplateId(tmpl.id)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary-subtle border-primary-border ring-1 ring-primary/30'
                            : 'bg-surface border-border hover:border-border-interactive'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="text-sm font-semibold text-text-primary truncate">
                            {tmpl.name}
                          </h4>
                          {isSelected && (
                            <Check className="w-4 h-4 text-primary-text shrink-0" strokeWidth={2} />
                          )}
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-1 tabular-nums">
                          {tmpl.workflow_template_stages.length} stages
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Template Stages Preview */}
              {selectedTemplate && (
                <div className="p-4 bg-surface-muted/40 border border-border rounded-xl space-y-2.5">
                  <span className="text-xs font-semibold text-text-primary">
                    Template Pipeline Preview ({selectedTemplate.workflow_template_stages.length}{' '}
                    stages):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTemplate.workflow_template_stages.map((s, idx) => (
                      <span
                        key={s.id || idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-text-primary bg-surface border border-border rounded-md"
                      >
                        <span className="w-4 h-4 rounded-full bg-surface-muted text-[10px] font-mono flex items-center justify-center text-text-secondary tabular-nums">
                          {idx + 1}
                        </span>
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode Selection (if project already has stages) */}
              {hasExistingStages && (
                <div className="space-y-2 pt-2 border-t border-border-subtle">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Application Mode:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setMode('append')}
                      className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                        mode === 'append'
                          ? 'bg-primary-subtle border-primary-border ring-1 ring-primary/30'
                          : 'bg-surface border-border hover:border-border-interactive'
                      }`}
                    >
                      <span className="text-xs font-semibold text-text-primary mb-0.5">
                        Append Stages
                      </span>
                      <span className="text-xs text-text-secondary">
                        Add these stages after your existing project stages.
                      </span>
                    </label>

                    <label
                      onClick={() => setMode('replace')}
                      className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                        mode === 'replace'
                          ? 'bg-primary-subtle border-primary-border ring-1 ring-primary/30'
                          : 'bg-surface border-border hover:border-border-interactive'
                      }`}
                    >
                      <span className="text-xs font-semibold text-text-primary mb-0.5">
                        Replace Stages
                      </span>
                      <span className="text-xs text-text-secondary">
                        Overwrite existing stages. Associated tasks will become unassigned.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-surface-muted/30 border-t border-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedTemplateId || isApplying || templates.length === 0}
            onClick={handleApplySubmit}
            className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-lg transition-colors shadow-subtle"
          >
            {isApplying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {mode === 'replace' ? 'Replace & Apply Template' : 'Apply Template'}
          </button>
        </div>
      </div>
    </div>
  );
};
