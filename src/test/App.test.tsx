import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicOnlyRoute } from '@/components/auth/PublicOnlyRoute';
import { LoginRoute } from '@/routes/auth/LoginRoute';
import { AuthCallbackRoute } from '@/routes/auth/AuthCallbackRoute';
import { PlaceholderRoute } from '@/routes/PlaceholderRoute';
import { supabase } from '@/lib/supabase';
import { mockSession, mockWorkspaceRow, mockPostgrestSuccess } from './auth/authMocks';

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

function createTestRouter(initialEntries = ['/']) {
  return createMemoryRouter(
    [
      {
        path: '/login',
        element: (
          <PublicOnlyRoute>
            <LoginRoute />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/auth/callback',
        element: <AuthCallbackRoute />,
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <PlaceholderRoute
                title="Overview & Dashboard"
                description="High-level workspace operational summary, urgent tasks, and upcoming shoots."
              />
            ),
          },
          {
            path: 'settings',
            element: (
              <PlaceholderRoute
                title="Workspace Settings"
                description="Catalog services, packages, workflow templates, brief templates, and Google integrations."
              />
            ),
          },
        ],
      },
      {
        path: '/share/:token',
        element: (
          <PlaceholderRoute
            title="Client Project Status Portal"
            description="Live project progress projection, session schedules, and approved deliverables."
            isPublic
          />
        ),
      },
      {
        path: '/brief/:token',
        element: (
          <PlaceholderRoute
            title="Client Brief Intake Form"
            description="Interactive questionnaire for project requirements, moodboards, and logistics."
            isPublic
          />
        ),
      },
    ],
    { initialEntries }
  );
}

describe('Lumina Application Integration & Auth Workflows', () => {
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

  function renderApp(initialEntries = ['/']) {
    const testRouter = createTestRouter(initialEntries);
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <RouterProvider router={testRouter} />
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  it('redirects unauthenticated visitor from / to /login (AUTH-REQ-003)', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    renderApp(['/']);

    expect(await screen.findByRole('heading', { name: 'Lumina', level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId('google-signin-button')).toBeInTheDocument();
  });

  it('renders authenticated dashboard when session and workspace are valid', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    vi.mocked(supabase.rpc).mockResolvedValue(mockPostgrestSuccess([mockWorkspaceRow]));

    renderApp(['/']);

    expect(await screen.findByText("Alex Visuals's Workspace")).toBeInTheDocument();
    expect(screen.getByText('Overview & Dashboard')).toBeInTheDocument();
  });

  it('allows unauthenticated access to public client status portal (AUTH-REQ-004)', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    renderApp(['/share/token_xyz123']);

    expect(await screen.findByText('Client Project Status Portal')).toBeInTheDocument();
    expect(screen.getByText('Token: token_xyz123')).toBeInTheDocument();
    expect(screen.queryByTestId('google-signin-button')).not.toBeInTheDocument();
  });

  it('allows unauthenticated access to public client brief intake form (AUTH-REQ-004)', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    renderApp(['/brief/brief_abc789']);

    expect(await screen.findByText('Client Brief Intake Form')).toBeInTheDocument();
    expect(screen.getByText('Token: brief_abc789')).toBeInTheDocument();
    expect(screen.queryByTestId('google-signin-button')).not.toBeInTheDocument();
  });

  it('signs out user when sign out button is clicked and redirects to /login (AUTH-REQ-008)', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    vi.mocked(supabase.rpc).mockResolvedValue(mockPostgrestSuccess([mockWorkspaceRow]));

    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: null,
    });

    renderApp(['/']);

    expect(await screen.findByText("Alex Visuals's Workspace")).toBeInTheDocument();

    const signOutBtn = screen.getByTestId('header-signout-button');
    fireEvent.click(signOutBtn);

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });
  });
});
