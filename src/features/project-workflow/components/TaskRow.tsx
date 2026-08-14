import React from 'react';
import { Check, Calendar, Edit2, Trash2, FileText, Loader2 } from 'lucide-react';
import type { Task } from '../types';

interface TaskRowProps {
  task: Task;
  onToggleStatus: () => Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
  isToggling?: boolean;
  disabled?: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  isToggling = false,
  disabled = false,
}) => {
  const isDone = task.status === 'done';

  // Format due date & compute overdue status
  const getDueDateInfo = () => {
    if (!task.due_date) return null;

    const today = new Date().toISOString().slice(0, 10);
    const isOverdue = !isDone && task.due_date < today;
    const isDueToday = !isDone && task.due_date === today;

    return {
      text: task.due_date,
      isOverdue,
      isDueToday,
    };
  };

  const dueInfo = getDueDateInfo();

  return (
    <div
      className={`group flex items-start gap-3 p-3.5 bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700/80 rounded-xl transition-all ${
        isDone ? 'opacity-70' : ''
      }`}
    >
      {/* Checkbox Touch Target */}
      <button
        type="button"
        disabled={disabled || isToggling}
        onClick={onToggleStatus}
        role="checkbox"
        aria-checked={isDone}
        aria-label={`Mark task ${task.title} as ${isDone ? 'open' : 'done'}`}
        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all mt-0.5 shrink-0 ${
          isDone
            ? 'bg-emerald-500 border-emerald-500 text-neutral-950 shadow-sm'
            : 'bg-neutral-950 border-neutral-700 hover:border-amber-400 text-transparent'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isToggling ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
        ) : (
          <Check className={`w-4 h-4 stroke-[3] ${isDone ? 'text-neutral-950' : 'hidden'}`} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span
            className={`text-sm font-semibold leading-snug break-words ${
              isDone ? 'line-through text-neutral-400 font-normal' : 'text-neutral-100'
            }`}
          >
            {task.title}
          </span>

          {/* Stage Pill */}
          {task.stage && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-neutral-300 bg-neutral-950 border border-neutral-800 rounded-md shrink-0">
              {task.stage.label}
            </span>
          )}

          {/* Due Date Badge */}
          {dueInfo && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md shrink-0 border ${
                dueInfo.isOverdue
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : dueInfo.isDueToday
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {dueInfo.isOverdue && <span className="font-bold">Overdue: </span>}
              {dueInfo.isDueToday && <span className="font-bold">Due today: </span>}
              {dueInfo.text}
            </span>
          )}
        </div>

        {/* Notes preview */}
        {task.notes && (
          <div className="flex items-start gap-1 text-xs text-neutral-400 mt-1">
            <FileText className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">{task.notes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!disabled && (
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit task ${task.title}`}
            className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete task ${task.title}`}
            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
