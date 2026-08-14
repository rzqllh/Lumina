import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { LoginRoute } from '@/routes/auth/LoginRoute';
import { supabase } from '@/lib/supabase';
import { mockAuthError } from './authMocks';

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

describe('LoginRoute (AUTH-REQ-001 / AUTH-REQ-009)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    } as never);
  });

  function renderLoginRoute(initialEntries = ['/login']) {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={initialEntries}>
              <Routes>
                <Route path="/login" element={<LoginRoute />} />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  it('renders login brand header, subtitle, and Google sign-in button', async () => {
    renderLoginRoute();

    expect(await screen.findByRole('heading', { name: 'Lumina', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Manage your photography work in one place.')).toBeInTheDocument();
    expect(screen.getByTestId('google-signin-button')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('initiates Google OAuth with identity scopes when button is clicked (AUTH-REQ-001)', async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
      data: { provider: 'google', url: 'https://accounts.google.com' },
      error: null,
    });

    renderLoginRoute();

    const button = await screen.findByTestId('google-signin-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledTimes(1);
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          options: expect.objectContaining({
            scopes: 'openid email profile',
            redirectTo: expect.stringContaining('/auth/callback'),
          }),
        })
      );
    });
  });

  it('displays actionable error notice when URL contains error parameter', async () => {
    renderLoginRoute(['/login?error=auth_failed']);

    expect(await screen.findByTestId('login-error-alert')).toBeInTheDocument();
    expect(
      screen.getByText('Authentication failed or was cancelled. Please try again.')
    ).toBeInTheDocument();
  });

  it('displays error notice when signInWithOAuth returns an error (AUTH-REQ-009)', async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
      data: { provider: 'google', url: null },
      error: mockAuthError('Popup closed by user', 400),
    });

    renderLoginRoute();

    const button = await screen.findByTestId('google-signin-button');
    fireEvent.click(button);

    expect(await screen.findByTestId('login-error-alert')).toBeInTheDocument();
    expect(screen.getByText('Popup closed by user')).toBeInTheDocument();
  });
});
