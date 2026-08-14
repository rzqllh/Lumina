import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/lib/auth';
import { fetchPackages, fetchPackageById } from '../api/packagesApi';
import type { PackageWithItems } from '../types/catalogTypes';

export function usePackages(activeOnly: boolean = false) {
  const { workspaceId } = useWorkspace();

  return useQuery<PackageWithItems[], Error>({
    queryKey: ['packages', workspaceId, { activeOnly }],
    queryFn: () => {
      if (!workspaceId) return Promise.resolve([]);
      return fetchPackages(workspaceId, activeOnly);
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePackage(packageId: string | undefined) {
  const { workspaceId } = useWorkspace();

  return useQuery<PackageWithItems | null, Error>({
    queryKey: ['package', workspaceId, packageId],
    queryFn: () => {
      if (!workspaceId || !packageId) return Promise.resolve(null);
      return fetchPackageById(workspaceId, packageId);
    },
    enabled: !!workspaceId && !!packageId,
    staleTime: 1000 * 60 * 2,
  });
}
