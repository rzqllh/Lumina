import { useQuery } from '@tanstack/react-query';
import { fetchWorkspaceDashboardData } from '../api/dashboardApi';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: (workspaceId: string) => [...dashboardKeys.all, 'overview', workspaceId] as const,
  calendar: (workspaceId: string) => [...dashboardKeys.all, 'calendar', workspaceId] as const,
};

export function useDashboardData(workspaceId: string) {
  return useQuery({
    queryKey: dashboardKeys.overview(workspaceId),
    queryFn: () => fetchWorkspaceDashboardData(workspaceId),
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
  });
}
