import React, { useState } from 'react';
import { useWorkspaceBriefTemplates } from '../hooks/useBriefs';
import { X, Layers, Check, Sparkles } from 'lucide-react';

interface ApplyBriefTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onApplyTemplate: (templateId: string) => Promise<void>;
  isPending?: boolean;
}

export const ApplyBriefTemplateModal: React.FC<ApplyBriefTemplateModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  onApplyTemplate,
  isPending = false,
}) => {
  const { data: templates = [], isLoading } = useWorkspaceBriefTemplates(workspaceId);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div
        data-testid="apply-brief-template-modal"
        className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Apply Brief Template
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Select a preset brief structure to instantiate onto this project
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-text-muted">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-8 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-text-muted mb-2" />
              <p className="text-xs font-semibold text-text-primary">No brief templates found</p>
              <p className="text-[11px] text-text-muted mt-1">
                Save this project's brief as a template to reuse it later!
              </p>
            </div>
          ) : (
            templates.map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id;
              const sectionsCount = tmpl.sections?.length || 0;
              const fieldsCount =
                tmpl.sections?.reduce((acc, s) => acc + (s.fields?.length || 0), 0) || 0;

              return (
                <div
                  key={tmpl.id}
                  data-testid={`brief-template-option-${tmpl.id}`}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border bg-surface hover:border-border-subtle hover:bg-surface-muted/30'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">{tmpl.name}</span>
                      <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold text-text-secondary">
                        {sectionsCount} sections • {fieldsCount} questions
                      </span>
                    </div>
                    {tmpl.description && (
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        {tmpl.description}
                      </p>
                    )}
                  </div>

                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-surface'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedTemplateId || isPending}
            onClick={() => selectedTemplateId && onApplyTemplate(selectedTemplateId)}
            data-testid="confirm-apply-template-btn"
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPending ? 'Applying...' : 'Apply Template'}
          </button>
        </div>
      </div>
    </div>
  );
};
