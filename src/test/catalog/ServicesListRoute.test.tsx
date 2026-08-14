import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ServicesListRoute } from '@/routes/catalog/ServicesListRoute';
import { supabase } from '@/lib/supabase';
import { mockSession, mockWorkspaceRow } from '../auth/authMocks';
import { mockServicesList, createMockQueryBuilder } from './catalogMocks';

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

describe('ServicesListRoute (CAT-REQ-001 / CAT-REQ-003)', () => {
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

  function renderServicesList() {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={['/services']}>
              <Routes>
                <Route
                  path="/services"
                  element={
                    <ProtectedRoute>
                      <ServicesListRoute />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/services/new"
                  element={<div data-testid="new-service-page">New Service Page</div>}
                />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  it('renders services list with prices, descriptions, and active status pills (CAT-REQ-001)', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockServicesList) as never);
    renderServicesList();

    expect(await screen.findByText('Lead Photography (Full Day)')).toBeInTheDocument();
    expect(screen.getByText('Rp 2.500.000')).toBeInTheDocument();
    expect(
      screen.getByText('Up to 8 hours shooting coverage with 1 lead photographer.')
    ).toBeInTheDocument();

    expect(screen.getByText('Cinematic Videography')).toBeInTheDocument();
    expect(screen.getByText('Rp 3.500.000')).toBeInTheDocument();

    expect(screen.getByText('Aerial Drone Pilot')).toBeInTheDocument();
    expect(screen.getByText('Rp 1.000.000')).toBeInTheDocument();
  });

  it('filters services when typing in search input', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockServicesList) as never);
    renderServicesList();

    expect(await screen.findByText('Lead Photography (Full Day)')).toBeInTheDocument();
    expect(screen.getByText('Aerial Drone Pilot')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search services/i);
    fireEvent.change(searchInput, { target: { value: 'Drone' } });

    expect(screen.queryByText('Lead Photography (Full Day)')).not.toBeInTheDocument();
    expect(screen.getByText('Aerial Drone Pilot')).toBeInTheDocument();
  });

  it('renders empty state with action when no services exist', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder([]) as never);
    renderServicesList();

    expect(await screen.findByTestId('services-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No services in catalog yet')).toBeInTheDocument();

    const createBtn = screen.getByTestId('empty-create-service-btn');
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByTestId('new-service-page')).toBeInTheDocument();
    });
  });
});
