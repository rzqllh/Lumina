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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stage-manager-title"
    >
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
          <div>
            <h2 id="stage-manager-title" className="text-base font-bold text-neutral-100">
              Customize Project Workflow Stages
            </h2>
            <p className="text-xs text-neutral-400">
              Add, rename, reorder, or remove stages for this project.
            </p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Add Stage Form */}
          {!disabled && (
            <form onSubmit={handleAddSubmit} className="flex gap-2">
              <input
                type="text"
                value={newStageLabel}
                onChange={(e) => setNewStageLabel(e.target.value)}
                placeholder="New stage name (e.g. Gallery Review)..."
                className="flex-1 px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
              <button
                type="submit"
                disabled={!newStageLabel.trim() || isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Stage
              </button>
            </form>
          )}

          {/* Stages List */}
          <div className="space-y-2">
            {stages.length === 0 ? (
              <p className="text-center py-6 text-xs text-neutral-500">
                No stages in this project yet. Add one above or apply a template.
              </p>
            ) : (
              stages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between gap-2 p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded bg-neutral-800 text-[11px] font-mono flex items-center justify-center text-neutral-400 shrink-0">
                      {idx + 1}
                    </span>

                    {editingId === stage.id ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-neutral-900 border border-amber-500/50 rounded text-xs text-neutral-100 focus:outline-none"
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
                          className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1 text-neutral-400 hover:bg-neutral-800 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-semibold text-neutral-200 truncate">
                          {stage.label}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
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
                        className="p-1 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 rounded hover:bg-neutral-800"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === stages.length - 1 || isSubmitting}
                        onClick={() => handleMove(idx, 'down')}
                        aria-label={`Move stage ${stage.label} down`}
                        className="p-1 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 rounded hover:bg-neutral-800"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(stage)}
                        aria-label={`Rename stage ${stage.label}`}
                        className="p-1 text-neutral-400 hover:text-amber-400 rounded hover:bg-neutral-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(stage.id)}
                        aria-label={`Delete stage ${stage.label}`}
                        className="p-1 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-neutral-950/50 border-t border-neutral-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      {/* Delete Confirmation Alert Modal */}
      {deletingId && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm p-5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-sm font-bold text-neutral-100">Remove Workflow Stage?</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Removing this stage will <strong className="text-neutral-200">not</strong> delete your
              tasks. Tasks assigned to this stage will be detached to unassigned.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDeleteConfirm(deletingId)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-md"
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
