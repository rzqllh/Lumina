import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { WorkspaceContext } from './contexts';
import { useAuth } from './useAuth';
import type { WorkspaceContextValue, WorkspaceInfo } from './types';

export interface WorkspaceProviderProps {
  children: React.ReactNode;
}

interface BootstrapRpcRow {
  workspace_id: string;
  workspace_name: string;
  member_role: string;
  is_new: boolean;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { user, status } = useAuth();
  const isAuthenticated = status === 'authenticated' && !!user?.id;

  const {
    data: currentWorkspace = null,
    isLoading,
    error,
    refetch,
  } = useQuery<WorkspaceInfo | null, Error>({
    queryKey: ['workspace', user?.id],
    queryFn: async () => {
      if (!isAuthenticated) return null;

      const { data, error: rpcError } = await supabase.rpc('bootstrap_personal_workspace');
      if (rpcError) {
        throw new Error(rpcError.message || 'Failed to bootstrap workspace');
      }

      const rows = data as unknown as BootstrapRpcRow[];
      if (!rows || rows.length === 0) {
        throw new Error('Workspace bootstrap returned no records');
      }

      const row = rows[0];
      return {
        id: row.workspace_id,
        name: row.workspace_name,
        role: row.member_role,
        isNew: row.is_new,
      };
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      currentWorkspace,
      workspaceId: currentWorkspace?.id ?? null,
      isLoading: isAuthenticated ? isLoading : false,
      error: error ?? null,
      refetchWorkspace: async () => {
        await refetch();
      },
    }),
    [currentWorkspace, isAuthenticated, isLoading, error, refetch]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
