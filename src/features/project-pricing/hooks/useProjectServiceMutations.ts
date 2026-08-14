import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/lib/auth';
import {
  addServiceSnapshot,
  addCustomLine,
  updateProjectService,
  removeProjectService,
  applyPackageToProject,
} from '../api/projectServicesApi';
import { projectServicesQueryKey } from './useProjectServices';
import type {
  AddServiceSnapshotInput,
  AddCustomLineInput,
  UpdateProjectServiceInput,
} from '../types/projectPricingTypes';

export function useProjectServiceMutations(projectId: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspace();
  const wsId = workspaceId ?? '';

  function invalidate() {
    void queryClient.invalidateQueries({
      queryKey: projectServicesQueryKey(wsId, projectId),
    });
  }

  const addServiceSnapshotMutation = useMutation({
    mutationFn: (input: Omit<AddServiceSnapshotInput, 'workspace_id' | 'project_id'>) =>
      addServiceSnapshot({ ...input, workspace_id: wsId, project_id: projectId }),
    onSuccess: invalidate,
  });

  const addCustomLineMutation = useMutation({
    mutationFn: (input: Omit<AddCustomLineInput, 'workspace_id' | 'project_id'>) =>
      addCustomLine({ ...input, workspace_id: wsId, project_id: projectId }),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectServiceInput }) =>
      updateProjectService(id, wsId, input),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeProjectService(id, wsId),
    onSuccess: invalidate,
  });

  const applyPackageMutation = useMutation({
    mutationFn: (packageId: string) =>
      applyPackageToProject(wsId, projectId, packageId),
    onSuccess: invalidate,
  });

  return {
    addServiceSnapshotMutation,
    addCustomLineMutation,
    updateMutation,
    removeMutation,
    applyPackageMutation,
  };
}
