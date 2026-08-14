import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ClientDetailRoute } from '@/routes/clients/ClientDetailRoute';
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

describe('ClientDetailRoute (CLIENT-REQ-004 / CLIENT-REQ-005)', () => {
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

  function setupClientDetailMocks() {
    const clientsBuilder = createMockQueryBuilder(mockSingleClientWithContacts);
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

    return { clientsBuilder, contactsBuilder };
  }

  function renderClientDetail() {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={['/clients/cli_couple_123']}>
              <Routes>
                <Route
                  path="/clients/:clientId"
                  element={
                    <ProtectedRoute>
                      <ClientDetailRoute />
                    </ProtectedRoute>
                  }
                />
                <Route path="/clients" element={<div>Clients List</div>} />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  it('renders client identity and list of person contacts (CLIENT-REQ-004)', async () => {
    setupClientDetailMocks();
    renderClientDetail();

    expect(await screen.findByText('Sarah & Dave Wedding')).toBeInTheDocument();
    expect(screen.getByText('Referred by Bali Villa Coordinator.')).toBeInTheDocument();
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
    expect(screen.getByText('Bride')).toBeInTheDocument();
    expect(screen.getByText('Dave Miller')).toBeInTheDocument();
    expect(screen.getByText('Groom')).toBeInTheDocument();
    expect(screen.getByText('Projects (0)')).toBeInTheDocument();
  });

  it('opens add contact modal and creates a new contact (CLIENT-REQ-005)', async () => {
    setupClientDetailMocks();
    renderClientDetail();

    expect(await screen.findByText('Sarah & Dave Wedding')).toBeInTheDocument();

    const addContactBtn = screen.getByTestId('add-contact-btn');
    fireEvent.click(addContactBtn);

    expect(screen.getByRole('heading', { name: 'Add Person Contact' })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/full name/i);
    const roleInput = screen.getByLabelText(/role \/ relationship/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const saveBtn = screen.getByTestId('save-contact-button');

    fireEvent.change(nameInput, { target: { value: 'Jessica Bridesmaid' } });
    fireEvent.change(roleInput, { target: { value: 'Bridesmaid PIC' } });
    fireEvent.change(emailInput, { target: { value: 'jessica@example.com' } });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Add Person Contact' })).not.toBeInTheDocument();
    });
  });

  it('opens delete contact confirmation dialog and removes contact', async () => {
    setupClientDetailMocks();
    renderClientDetail();

    expect(await screen.findByText('Sarah & Dave Wedding')).toBeInTheDocument();

    const deleteBtn = screen.getByTestId('delete-contact-btn-con_groom_2');
    fireEvent.click(deleteBtn);

    expect(screen.getByRole('heading', { name: 'Delete Contact' })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to remove/)).toBeInTheDocument();

    const confirmBtn = screen.getByTestId('confirm-delete-contact-btn');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Delete Contact' })).not.toBeInTheDocument();
    });
  });
});
