import React, { useState } from 'react';
import { CheckSquare, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { useProjectTasks } from '../hooks/useProjectTasks';
import { useTaskMutations } from '../hooks/useTaskMutations';
import { TaskRow } from './TaskRow';
import { TaskFormModal } from './TaskFormModal';
import type { Task, ProjectWorkflowStage } from '../types';
import type { TaskFormData } from '../schemas/workflowSchemas';

interface ProjectTasksSectionProps {
  workspaceId: string;
  projectId: string;
  stages: ProjectWorkflowStage[];
  isForceClosed?: boolean;
  selectedStageId?: string | null;
  onSelectStage?: (stageId: string | null) => void;
}

export const ProjectTasksSection: React.FC<ProjectTasksSectionProps> = ({
  workspaceId,
  projectId,
  stages,
  isForceClosed = false,
  selectedStageId,
  onSelectStage,
}) => {
  const [internalStageId, setInternalStageId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'done'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  const activeStageId = selectedStageId !== undefined ? selectedStageId : internalStageId;

  const handleStageSelect = (stageId: string | null) => {
    if (onSelectStage) {
      onSelectStage(stageId);
    } else {
      setInternalStageId(stageId);
    }
  };

  const { data: tasks = [], isLoading, error } = useProjectTasks(workspaceId, projectId);

  const {
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    isCreatingTask,
    isUpdatingTask,
    isDeletingTask,
  } = useTaskMutations();

  // Filter tasks by active stage and status
  const filteredTasks = tasks.filter((t) => {
    if (activeStageId === 'unassigned') {
      if (t.stage_id !== null) return false;
    } else if (activeStageId && t.stage_id !== activeStageId) {
      return false;
    }

    if (statusFilter === 'open' && t.status !== 'open') return false;
    if (statusFilter === 'done' && t.status !== 'done') return false;

    return true;
  });

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;

  const handleCreateSubmit = async (data: TaskFormData) => {
    await createTask({
      workspace_id: workspaceId,
      project_id: projectId,
      title: data.title,
      stage_id: data.stage_id || null,
      due_date: data.due_date || null,
      notes: data.notes || null,
      status: data.status,
    });
  };

  const handleEditSubmit = async (data: TaskFormData) => {
    if (!editingTask) return;
    await updateTask({
      workspaceId,
      projectId,
      taskId: editingTask.id,
      input: {
        title: data.title,
        stage_id: data.stage_id || null,
        due_date: data.due_date || null,
        notes: data.notes || null,
        status: data.status,
      },
    });
    setEditingTask(null);
  };

  const handleToggle = async (task: Task) => {
    setTogglingTaskId(task.id);
    try {
      await toggleTask({
        workspaceId,
        projectId,
        taskId: task.id,
        currentStatus: task.status,
      });
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleDeleteConfirm = async (taskId: string) => {
    await deleteTask({
      workspaceId,
      projectId,
      taskId,
    });
    setDeletingTaskId(null);
  };

  return (
    <section
      aria-labelledby="project-tasks-heading"
      className="space-y-4 pt-4 border-t border-neutral-800/80"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 id="project-tasks-heading" className="text-base font-bold text-neutral-100">
              Action Items & Tasks
            </h3>
            <p className="text-xs text-neutral-400">
              Checklist of operational tasks across workflow stages.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {totalTasks > 0 && (
            <span className="text-xs font-medium text-neutral-400">
              {doneTasks} of {totalTasks} done
            </span>
          )}

          {!isForceClosed && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        {/* Stage Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            onClick={() => handleStageSelect(null)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              !activeStageId
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
            }`}
          >
            All Tasks ({tasks.length})
          </button>

          {stages.map((s) => {
            const stageTaskCount = tasks.filter((t) => t.stage_id === s.id).length;
            const isSelected = activeStageId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStageSelect(isSelected ? null : s.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
                }`}
              >
                {s.label} ({stageTaskCount})
              </button>
            );
          })}

          {tasks.some((t) => !t.stage_id) && (
            <button
              type="button"
              onClick={() =>
                handleStageSelect(activeStageId === 'unassigned' ? null : 'unassigned')
              }
              className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeStageId === 'unassigned'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
              }`}
            >
              Unassigned ({tasks.filter((t) => !t.stage_id).length})
            </button>
          )}
        </div>

        {/* Status Filter Toggle */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <span className="text-[11px] text-neutral-500 font-medium">Show:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'done')}
            className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          >
            <option value="all">All</option>
            <option value="open">Open Only</option>
            <option value="done">Completed Only</option>
          </select>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 text-neutral-400 bg-neutral-900/30 border border-neutral-800 rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading tasks...
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
          Failed to load project tasks. Please try refreshing.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-4 bg-neutral-900/30 border border-neutral-800 border-dashed rounded-xl text-center">
          <CheckSquare className="w-8 h-8 text-neutral-600 mb-2" />
          <h4 className="text-sm font-semibold text-neutral-200 mb-1">
            {tasks.length === 0 ? 'No action items yet' : 'No tasks match current filter'}
          </h4>
          <p className="text-xs text-neutral-400 max-w-sm mb-4">
            {tasks.length === 0
              ? 'Track pre-production checklists, gear prep, editing batches, and client tasks.'
              : 'Try clearing your stage or status filters.'}
          </p>
          {!isForceClosed && tasks.length === 0 && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add First Task
            </button>
          )}
        </div>
      )}

      {/* Tasks List */}
      {!isLoading && !error && filteredTasks.length > 0 && (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggleStatus={() => handleToggle(task)}
              onEdit={() => setEditingTask(task)}
              onDelete={() => setDeletingTaskId(task.id)}
              isToggling={togglingTaskId === task.id}
              disabled={isForceClosed}
            />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <TaskFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        stages={stages}
        defaultStageId={activeStageId && activeStageId !== 'unassigned' ? activeStageId : null}
        isSubmitting={isCreatingTask}
      />

      {/* Edit Task Modal */}
      <TaskFormModal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSubmit={handleEditSubmit}
        stages={stages}
        initialData={editingTask}
        isSubmitting={isUpdatingTask}
      />

      {/* Delete Confirmation Modal */}
      {deletingTaskId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm p-5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-sm font-bold text-neutral-100">Delete Action Item?</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTaskId(null)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingTask}
                onClick={() => handleDeleteConfirm(deletingTaskId)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-md"
              >
                {isDeletingTask && <Loader2 className="w-3 h-3 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
