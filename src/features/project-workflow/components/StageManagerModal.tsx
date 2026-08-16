import React, { useState } from 'react';
import {
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import type { ProjectWorkflowStage } from '../types';

interface StageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: ProjectWorkflowStage[];
  onCreateStage: (label: string) => Promise<void>;
  onUpdateStage: (stageId: string, label: string) => Promise<void>;
  onReorderStages: (stageOrders: { id: string; position: number }[]) => Promise<void>;
  onDeleteStage: (stageId: string) => Promise<void>;
  disabled?: boolean;
}

export const StageManagerModal: React.FC<StageManagerModalProps> = ({
  isOpen,
  onClose,
  stages,
  onCreateStage,
  onUpdateStage,
  onReorderStages,
  onDeleteStage,
  disabled = false,
}) => {
  const [newStageLabel, setNewStageLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageLabel.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreateStage(newStageLabel.trim());
      setNewStageLabel('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (stage: ProjectWorkflowStage) => {
    setEditingId(stage.id);
    setEditLabel(stage.label);
  };

  const handleSaveEdit = async (stageId: string) => {
    if (!editLabel.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onUpdateStage(stageId, editLabel.trim());
      setEditingId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stages.length || isSubmitting) return;

    const newStages = [...stages];
    const [moved] = newStages.splice(index, 1);
    newStages.splice(targetIndex, 0, moved);

    const orders = newStages.map((s, idx) => ({ id: s.id, position: idx }));
    setIsSubmitting(true);
    try {
      await onReorderStages(orders);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (stageId: string) => {
    setIsSubmitting(true);
    try {
      await onDeleteStage(stageId);
      setDeletingId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stage-manager-title"
    >
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-surface border border-border rounded-xl shadow-sheet overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 id="stage-manager-title" className="text-base font-semibold text-text-primary">
              Customize Project Workflow Stages
            </h2>
            <p className="text-xs text-text-secondary">
              Add, rename, reorder, or remove stages for this project.
            </p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Add Stage Form */}
          {!disabled && (
            <form onSubmit={handleAddSubmit} className="flex gap-2">
              <input
                type="text"
                value={newStageLabel}
                onChange={(e) => setNewStageLabel(e.target.value)}
                placeholder="New stage name (e.g. Gallery Review)..."
                className="flex-1 px-3.5 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                disabled={!newStageLabel.trim() || isSubmitting}
                className="inline-flex cursor-pointer items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-lg transition-colors shadow-subtle shrink-0"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add Stage
              </button>
            </form>
          )}

          {/* Stages List */}
          <div className="space-y-2">
            {stages.length === 0 ? (
              <p className="text-center py-6 text-xs text-text-muted">
                No stages in this project yet. Add one above or apply a template.
              </p>
            ) : (
              stages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between gap-2 p-3 bg-surface border border-border rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded bg-surface-muted text-[11px] font-mono flex items-center justify-center text-text-secondary shrink-0 tabular-nums">
                      {idx + 1}
                    </span>

                    {editingId === stage.id ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-surface border border-border-interactive rounded text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-ring"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(stage.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleSaveEdit(stage.id)}
                          className="p-1 text-status-success-text hover:bg-status-success-subtle rounded cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1 text-text-muted hover:bg-surface-muted rounded cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {stage.label}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted">
                          ({stage.status})
                        </span>
                      </div>
                    )}
                  </div>

                  {!disabled && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0 || isSubmitting}
                        onClick={() => handleMove(idx, 'up')}
                        aria-label={`Move stage ${stage.label} up`}
                        className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 rounded hover:bg-surface-muted cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === stages.length - 1 || isSubmitting}
                        onClick={() => handleMove(idx, 'down')}
                        aria-label={`Move stage ${stage.label} down`}
                        className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 rounded hover:bg-surface-muted cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(stage)}
                        aria-label={`Rename stage ${stage.label}`}
                        className="p-1 text-text-muted hover:text-primary-text rounded hover:bg-primary-subtle cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(stage.id)}
                        aria-label={`Delete stage ${stage.label}`}
                        className="p-1 text-text-muted hover:text-status-danger-text rounded hover:bg-status-danger-subtle cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-surface-muted/30 border-t border-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* Delete Confirmation Alert Modal */}
      {deletingId && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm p-5 bg-surface border border-border rounded-xl shadow-sheet space-y-3">
            <div className="flex items-center gap-2 text-status-warning-text">
              <AlertTriangle className="w-4 h-4" strokeWidth={1.75} />
              <h3 className="text-sm font-semibold text-text-primary">Remove Workflow Stage?</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Removing this stage will <strong className="text-text-primary">not</strong> delete
              your tasks. Tasks assigned to this stage will be detached to unassigned.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDeleteConfirm(deletingId)}
                className="inline-flex cursor-pointer items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-status-danger hover:bg-status-danger/90 rounded-md"
              >
                {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
