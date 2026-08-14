import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/lib/auth';
import { createProject, updateProject, deleteProject } from '../api/projectsApi';
import type { CreateProjectInput, UpdateProjectInput } from '../types/projectTypes';

export function useProjectMutations() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspace();

  const createProjectMutation = useMutation({
    mutationFn: (input: Omit<CreateProjectInput, 'workspace_id'>) => {
      if (!workspaceId) throw new Error('Workspace required');
      return createProject({ ...input, workspace_id: workspaceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: UpdateProjectInput }) => {
      if (!workspaceId) throw new Error('Workspace required');
      return updateProject(workspaceId, projectId, input);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['project', workspaceId, projectId] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => {
      if (!workspaceId) throw new Error('Workspace required');
      return deleteProject(workspaceId, projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });

  return {
    createProject: createProjectMutation,
    updateProject: updateProjectMutation,
    deleteProject: deleteProjectMutation,
  };
}
