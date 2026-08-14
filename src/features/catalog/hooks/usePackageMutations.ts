import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/lib/auth';
import { createPackage, updatePackage, duplicatePackage, deletePackage } from '../api/packagesApi';
import type { CreatePackageInput, UpdatePackageInput } from '../types/catalogTypes';

export function usePackageMutations() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspace();

  const createPackageMutation = useMutation({
    mutationFn: (input: Omit<CreatePackageInput, 'workspace_id'>) => {
      if (!workspaceId) throw new Error('Workspace required');
      return createPackage({ ...input, workspace_id: workspaceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages', workspaceId] });
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: ({ packageId, input }: { packageId: string; input: UpdatePackageInput }) => {
      if (!workspaceId) throw new Error('Workspace required');
      return updatePackage(workspaceId, packageId, input);
    },
    onSuccess: (_, { packageId }) => {
      queryClient.invalidateQueries({ queryKey: ['packages', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['package', workspaceId, packageId] });
    },
  });

  const duplicatePackageMutation = useMutation({
    mutationFn: ({ packageId, newName }: { packageId: string; newName?: string }) => {
      if (!workspaceId) throw new Error('Workspace required');
      return duplicatePackage(workspaceId, packageId, newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages', workspaceId] });
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: (packageId: string) => {
      if (!workspaceId) throw new Error('Workspace required');
      return deletePackage(workspaceId, packageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages', workspaceId] });
    },
  });

  return {
    createPackage: createPackageMutation,
    updatePackage: updatePackageMutation,
    duplicatePackage: duplicatePackageMutation,
    deletePackage: deletePackageMutation,
  };
}
