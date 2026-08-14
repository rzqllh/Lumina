import { useQuery } from '@tanstack/react-query';
import { fetchWorkspaceCalendarEvents } from '../api/dashboardApi';
import { dashboardKeys } from './useDashboardData';

export function useCalendarEvents(workspaceId: string) {
  return useQuery({
    queryKey: dashboardKeys.calendar(workspaceId),
    queryFn: () => fetchWorkspaceCalendarEvents(workspaceId),
    enabled: Boolean(workspaceId),
    staleTime: 30_000,
  });
}
