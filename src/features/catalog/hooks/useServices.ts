import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/lib/auth';
import { fetchServices, fetchServiceById } from '../api/servicesApi';
import type { Service } from '../types/catalogTypes';

export function useServices(activeOnly: boolean = false) {
  const { workspaceId } = useWorkspace();

  return useQuery<Service[], Error>({
    queryKey: ['services', workspaceId, { activeOnly }],
    queryFn: () => {
      if (!workspaceId) return Promise.resolve([]);
      return fetchServices(workspaceId, activeOnly);
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useService(serviceId: string | undefined) {
  const { workspaceId } = useWorkspace();

  return useQuery<Service | null, Error>({
    queryKey: ['service', workspaceId, serviceId],
    queryFn: () => {
      if (!workspaceId || !serviceId) return Promise.resolve(null);
      return fetchServiceById(workspaceId, serviceId);
    },
    enabled: !!workspaceId && !!serviceId,
    staleTime: 1000 * 60 * 2,
  });
}
