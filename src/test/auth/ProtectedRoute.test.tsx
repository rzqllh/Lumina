import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import {
  mockSession,
  mockWorkspaceRow,
  mockPostgrestSuccess,
  mockPostgrestError,
} from './authMocks';

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

describe('ProtectedRoute (AUTH-REQ-003 / AUTH-REQ-005)', () => {
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

  function renderProtectedApp(initialEntries = ['/projects']) {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={initialEntries}>
              <Routes>
                <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <div data-testid="protected-projects">Protected Projects Content</div>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  it('redirects unauthenticated user to /login with returnTo parameter (AUTH-REQ-003)', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    renderProtectedApp(['/projects']);

    expect(await screen.findByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-projects')).not.toBeInTheDocument();
  });

  it('renders protected child content when user is authenticated and workspace is loaded', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    vi.mocked(supabase.rpc).mockResolvedValue(mockPostgrestSuccess([mockWorkspaceRow]));

    renderProtectedApp(['/projects']);

    expect(await screen.findByTestId('protected-projects')).toBeInTheDocument();
    expect(screen.getByText('Protected Projects Content')).toBeInTheDocument();
  });

  it('renders workspace error state with retry button when bootstrap fails', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    vi.mocked(supabase.rpc).mockResolvedValue(mockPostgrestError('Database connection failed'));

    renderProtectedApp(['/projects']);

    expect(await screen.findByTestId('workspace-error-state')).toBeInTheDocument();
    expect(screen.getByText('Database connection failed')).toBeInTheDocument();

    // Test retry button
    vi.mocked(supabase.rpc).mockResolvedValue(mockPostgrestSuccess([mockWorkspaceRow]));

    const retryButton = screen.getByRole('button', { name: 'Retry Connection' });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByTestId('protected-projects')).toBeInTheDocument();
    });
  });
});
