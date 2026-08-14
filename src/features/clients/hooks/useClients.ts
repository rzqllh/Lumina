import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/lib/auth';
import { fetchClients } from '../api/clientsApi';
import type { ClientListItem } from '../types/clientTypes';

export function useClients(includeArchived = false) {
  const { workspaceId } = useWorkspace();

  return useQuery<ClientListItem[], Error>({
    queryKey: ['clients', workspaceId, { includeArchived }],
    queryFn: () => {
      if (!workspaceId) return Promise.resolve([]);
      return fetchClients(workspaceId, includeArchived);
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
