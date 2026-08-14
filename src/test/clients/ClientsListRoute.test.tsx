import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ClientsListRoute } from '@/routes/clients/ClientsListRoute';
import { supabase } from '@/lib/supabase';
import { mockSession, mockWorkspaceRow } from '../auth/authMocks';
import { mockClientList, createMockQueryBuilder } from './clientsMocks';

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

describe('ClientsListRoute (CLIENT-REQ-001 / CLIENT-REQ-008)', () => {
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

  function renderClientsList() {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={['/clients']}>
              <Routes>
                <Route
                  path="/clients"
                  element={
                    <ProtectedRoute>
                      <ClientsListRoute />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clients/new"
                  element={<div data-testid="new-client-page">New Client Page</div>}
                />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  it('renders clients list with cards and type badges (CLIENT-REQ-001)', async () => {
    vi.mocked(supabase.from).mockReturnValue(
      createMockQueryBuilder([mockClientList[0], mockClientList[1]]) as never
    );
    renderClientsList();

    expect(await screen.findByText('Sarah & Dave Wedding')).toBeInTheDocument();
    expect(screen.getByText('Couple')).toBeInTheDocument();
    expect(screen.getByText('2 contacts')).toBeInTheDocument();

    expect(screen.getByText('Nexus Tech Global')).toBeInTheDocument();
    expect(screen.getByText('Organization')).toBeInTheDocument();
  });

  it('filters clients list when searching by name', async () => {
    vi.mocked(supabase.from).mockReturnValue(
      createMockQueryBuilder([mockClientList[0], mockClientList[1]]) as never
    );
    renderClientsList();

    expect(await screen.findByText('Sarah & Dave Wedding')).toBeInTheDocument();
    expect(screen.getByText('Nexus Tech Global')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search clients/i);
    fireEvent.change(searchInput, { target: { value: 'Nexus' } });

    expect(screen.queryByText('Sarah & Dave Wedding')).not.toBeInTheDocument();
    expect(screen.getByText('Nexus Tech Global')).toBeInTheDocument();
  });

  it('renders empty state with Add Client action when no clients exist', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder([]) as never);
    renderClientsList();

    expect(await screen.findByTestId('clients-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No clients yet')).toBeInTheDocument();

    // The Add Client CTA is in the header, not the empty state
    const addBtn = screen.getByTestId('add-client-btn');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByTestId('new-client-page')).toBeInTheDocument();
    });
  });
});
