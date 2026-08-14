import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ClientEditRoute } from '@/routes/clients/ClientEditRoute';
import { supabase } from '@/lib/supabase';
import { mockSession, mockWorkspaceRow } from '../auth/authMocks';
import { mockSingleClientWithContacts, createMockQueryBuilder } from './clientsMocks';

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

describe('ClientEditRoute (CLIENT-REQ-003)', () => {
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

  function setupEditMocks() {
    const clientsBuilder = createMockQueryBuilder({
      ...mockSingleClientWithContacts,
      display_name: 'Sarah & Dave Wedding Updated',
      is_archived: true,
    });

    const contactsBuilder = createMockQueryBuilder(mockSingleClientWithContacts.contacts);

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'clients') {
        return clientsBuilder as never;
      }
      if (table === 'client_contacts') {
        return contactsBuilder as never;
      }
      return createMockQueryBuilder() as never;
    });

    return { clientsBuilder };
  }

  function renderClientEdit() {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={['/clients/cli_couple_123/edit']}>
              <Routes>
                <Route
                  path="/clients/:clientId/edit"
                  element={
                    <ProtectedRoute>
                      <ClientEditRoute />
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

  it('pre-populates existing values and updates client on submission (CLIENT-REQ-003)', async () => {
    const { clientsBuilder } = setupEditMocks();
    renderClientEdit();

    const nameInput = await screen.findByDisplayValue('Sarah & Dave Wedding Updated');
    expect(nameInput).toBeInTheDocument();

    const archiveCheckbox = screen.getByLabelText(/archive this client/i);
    expect(archiveCheckbox).toBeChecked();

    fireEvent.change(nameInput, { target: { value: 'Sarah & Dave Wedding Final' } });

    const submitBtn = screen.getByRole('button', { name: 'Update Client' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(clientsBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          display_name: 'Sarah & Dave Wedding Final',
          is_archived: true,
        })
      );
      expect(screen.getByTestId('client-detail-page')).toBeInTheDocument();
    });
  });
});
