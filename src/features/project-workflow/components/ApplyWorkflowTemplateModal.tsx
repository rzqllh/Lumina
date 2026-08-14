import React, { useState } from 'react';
import { X, Sparkles, Loader2, Workflow, Check } from 'lucide-react';
import { useWorkflowTemplates } from '@/features/workflow-templates';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-template-title"
    >
      <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="apply-template-title" className="text-base font-bold text-neutral-100">
                Apply Workflow Template
              </h2>
              <p className="text-xs text-neutral-400">
                Snapshot preset stages directly into this project.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-neutral-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading workflow templates...
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
              Failed to load workflow templates.
            </div>
          )}

          {!isLoading && !error && templates.length === 0 && (
            <div className="text-center py-10 px-4 bg-neutral-950 border border-neutral-800 rounded-xl">
              <Workflow className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-300 mb-1">
                No active workflow templates
              </p>
              <p className="text-xs text-neutral-500">
                Create templates in the Catalog to apply them here.
              </p>
            </div>
          )}

          {!isLoading && templates.length > 0 && (
            <>
              {/* Template Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
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
                            ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="text-sm font-bold text-neutral-100 truncate">
                            {tmpl.name}
                          </h4>
                          {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-1">
                          {tmpl.workflow_template_stages.length} stages
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Template Stages Preview */}
              {selectedTemplate && (
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2.5">
                  <span className="text-xs font-semibold text-neutral-300">
                    Template Pipeline Preview ({selectedTemplate.workflow_template_stages.length}{' '}
                    stages):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTemplate.workflow_template_stages.map((s, idx) => (
                      <span
                        key={s.id || idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-md"
                      >
                        <span className="w-4 h-4 rounded-full bg-neutral-800 text-[10px] font-mono flex items-center justify-center text-neutral-400">
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
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <label className="block text-xs font-semibold text-neutral-300">
                    Application Mode:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setMode('append')}
                      className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                        mode === 'append'
                          ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                          : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-xs font-bold text-neutral-200 mb-0.5">
                        Append Stages
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Add these stages after your existing project stages.
                      </span>
                    </label>

                    <label
                      onClick={() => setMode('replace')}
                      className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                        mode === 'replace'
                          ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                          : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-xs font-bold text-neutral-200 mb-0.5">
                        Replace Stages
                      </span>
                      <span className="text-[11px] text-neutral-400">
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
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-950/50 border-t border-neutral-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedTemplateId || isApplying || templates.length === 0}
            onClick={handleApplySubmit}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
          >
            {isApplying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {mode === 'replace' ? 'Replace & Apply Template' : 'Apply Template'}
          </button>
        </div>
      </div>
    </div>
  );
};
