import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { AuthProvider, WorkspaceProvider, useWorkspace } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { mockSession, mockWorkspaceRow, mockPostgrestSuccess } from './authMocks';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
    rpc: vi.fn(),
  },
}));

describe('WorkspaceProvider & useWorkspace (AUTH-REQ-005 / AUTH-REQ-007)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    } as never);
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  it('calls bootstrap_personal_workspace RPC and provides workspace context when authenticated', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    vi.mocked(supabase.rpc).mockResolvedValue(mockPostgrestSuccess([mockWorkspaceRow]));

    const { result } = renderHook(() => useWorkspace(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.currentWorkspace).toEqual({
        id: 'ws_test_456',
        name: "Alex Visuals's Workspace",
        role: 'owner',
        isNew: true,
      });
      expect(result.current.workspaceId).toBe('ws_test_456');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(supabase.rpc).toHaveBeenCalledWith('bootstrap_personal_workspace');
  });

  it('does not invoke RPC when user is unauthenticated and provides null workspace', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useWorkspace(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.currentWorkspace).toBeNull();
      expect(result.current.workspaceId).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
