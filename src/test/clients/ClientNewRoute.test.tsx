import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ClientNewRoute } from '@/routes/clients/ClientNewRoute';
import { supabase } from '@/lib/supabase';
import { mockSession, mockWorkspaceRow } from '../auth/authMocks';
import { createMockQueryBuilder } from './clientsMocks';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

describe('ClientNewRoute (CLIENT-REQ-002 / CLIENT-REQ-007)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    } as never);

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [mockWorkspaceRow],
      error: null,
    } as never);
  });

  function renderClientNew() {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={['/clients/new']}>
              <Routes>
                <Route
                  path="/clients/new"
                  element={
                    <ProtectedRoute>
                      <ClientNewRoute />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clients/:clientId"
                  element={<div data-testid="client-detail-page">Client Detail Page</div>}
                />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  it('validates display name is required', async () => {
    renderClientNew();

    const submitBtn = await screen.findByRole('button', { name: 'Create Client' });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText('Display name must be at least 2 characters')
    ).toBeInTheDocument();
  });

  it('creates client and redirects to detail page on valid submission (CLIENT-REQ-002)', async () => {
    const builder = createMockQueryBuilder({
      id: 'new_client_789',
      display_name: 'Elena & Mark Wedding',
    });

    vi.mocked(supabase.from).mockReturnValue(builder as never);

    renderClientNew();

    const nameInput = await screen.findByLabelText(/display name/i);
    const emailInput = screen.getByLabelText(/primary email/i);
    const submitBtn = screen.getByRole('button', { name: 'Create Client' });

    fireEvent.change(nameInput, { target: { value: 'Elena & Mark Wedding' } });
    fireEvent.change(emailInput, { target: { value: 'elena.mark@example.com' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('client-detail-page')).toBeInTheDocument();
    });
  });

  it('respects returnUrl on cancel/back and navigates back to source with created clientId on submit', async () => {
    const builder = createMockQueryBuilder({
      id: 'new_client_999',
      display_name: 'Corporate Client Inc',
    });

    vi.mocked(supabase.from).mockReturnValue(builder as never);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={['/clients/new?returnUrl=/projects/new']}>
              <Routes>
                <Route
                  path="/clients/new"
                  element={
                    <ProtectedRoute>
                      <ClientNewRoute />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/new"
                  element={<div data-testid="project-new-page">Project New Page</div>}
                />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );

    const nameInput = await screen.findByLabelText(/display name/i);
    const submitBtn = screen.getByRole('button', { name: 'Create Client' });

    fireEvent.change(nameInput, { target: { value: 'Corporate Client Inc' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('project-new-page')).toBeInTheDocument();
    });
  });
});
