import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/lib/auth';
import { createService, updateService, deleteService } from '../api/servicesApi';
import type { CreateServiceInput, UpdateServiceInput } from '../types/catalogTypes';

export function useServiceMutations() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspace();

  const createServiceMutation = useMutation({
    mutationFn: (input: Omit<CreateServiceInput, 'workspace_id'>) => {
      if (!workspaceId) throw new Error('Workspace required');
      return createService({ ...input, workspace_id: workspaceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', workspaceId] });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ serviceId, input }: { serviceId: string; input: UpdateServiceInput }) => {
      if (!workspaceId) throw new Error('Workspace required');
      return updateService(workspaceId, serviceId, input);
    },
    onSuccess: (_, { serviceId }) => {
      queryClient.invalidateQueries({ queryKey: ['services', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['service', workspaceId, serviceId] });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: string) => {
      if (!workspaceId) throw new Error('Workspace required');
      return deleteService(workspaceId, serviceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', workspaceId] });
    },
  });

  return {
    createService: createServiceMutation,
    updateService: updateServiceMutation,
    deleteService: deleteServiceMutation,
  };
}
