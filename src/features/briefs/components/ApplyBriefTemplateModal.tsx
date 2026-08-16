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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
      <div
        data-testid="apply-brief-template-modal"
        className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-sheet space-y-5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary-text border border-primary-border">
              <Layers className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Apply Brief Template</h2>
              <p className="text-xs text-text-secondary">
                Select a preset brief structure to instantiate onto this project
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-text-muted">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-8 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-text-muted mb-2" strokeWidth={1.75} />
              <p className="text-xs font-semibold text-text-primary">No brief templates found</p>
              <p className="text-xs text-text-muted mt-1">
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
                  className={`flex items-start justify-between gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary-border bg-primary-subtle ring-1 ring-primary/30 shadow-2xs'
                      : 'border-border bg-surface hover:bg-surface-muted'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-primary">{tmpl.name}</span>
                      <span className="rounded-md bg-surface-muted border border-border-subtle px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary tabular-nums">
                        {sectionsCount} sections • {fieldsCount} questions
                      </span>
                    </div>
                    {tmpl.description && (
                      <p className="text-xs text-text-secondary leading-relaxed">
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
                    {isSelected && <Check className="h-3 w-3" strokeWidth={2} />}
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
            className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedTemplateId || isPending}
            onClick={() => selectedTemplateId && onApplyTemplate(selectedTemplateId)}
            data-testid="confirm-apply-template-btn"
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPending ? 'Applying...' : 'Apply Template'}
          </button>
        </div>
      </div>
    </div>
  );
};
