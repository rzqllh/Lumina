import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/lib/auth';
import { fetchClientById } from '../api/clientsApi';
import type { ClientWithContacts } from '../types/clientTypes';

export function useClient(clientId: string | undefined) {
  const { workspaceId } = useWorkspace();

  return useQuery<ClientWithContacts | null, Error>({
    queryKey: ['client', workspaceId, clientId],
    queryFn: () => {
      if (!workspaceId || !clientId) return Promise.resolve(null);
      return fetchClientById(workspaceId, clientId);
    },
    enabled: !!workspaceId && !!clientId,
    staleTime: 1000 * 60 * 2,
  });
}
