import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, updateTask, toggleTaskStatus, deleteTask } from '../api/projectTasksApi';
import { projectWorkflowKeys } from './useProjectStages';
import type { CreateTaskInput, UpdateTaskInput, TaskStatus } from '../types';

export function useTaskMutations() {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectWorkflowKeys.tasks(variables.workspace_id, variables.project_id),
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      taskId,
      input,
    }: {
      workspaceId: string;
      projectId: string;
      taskId: string;
      input: UpdateTaskInput;
    }) => updateTask(workspaceId, projectId, taskId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectWorkflowKeys.tasks(variables.workspaceId, variables.projectId),
      });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      taskId,
      currentStatus,
    }: {
      workspaceId: string;
      projectId: string;
      taskId: string;
      currentStatus: TaskStatus;
    }) => toggleTaskStatus(workspaceId, projectId, taskId, currentStatus),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectWorkflowKeys.tasks(variables.workspaceId, variables.projectId),
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      taskId,
    }: {
      workspaceId: string;
      projectId: string;
      taskId: string;
    }) => deleteTask(workspaceId, projectId, taskId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectWorkflowKeys.tasks(variables.workspaceId, variables.projectId),
      });
    },
  });

  return {
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    toggleTask: toggleTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    isCreatingTask: createTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isTogglingTask: toggleTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
  };
}
