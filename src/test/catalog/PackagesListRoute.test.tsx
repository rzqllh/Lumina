import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PackagesListRoute } from '@/routes/catalog/PackagesListRoute';
import { supabase } from '@/lib/supabase';
import { mockSession, mockWorkspaceRow } from '../auth/authMocks';
import { mockPackagesList, createMockQueryBuilder } from './catalogMocks';

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

describe('PackagesListRoute (CAT-REQ-004 / CAT-REQ-007 / CAT-REQ-008)', () => {
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

  function renderPackagesList() {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={['/packages']}>
              <Routes>
                <Route
                  path="/packages"
                  element={
                    <ProtectedRoute>
                      <PackagesListRoute />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/packages/new"
                  element={<div data-testid="new-package-page">New Package Page</div>}
                />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  it('renders packages list with computed totals and item count (CAT-REQ-004 / CAT-REQ-008)', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockPackagesList) as never);
    renderPackagesList();

    expect(await screen.findByText('Wedding Full Day Deluxe')).toBeInTheDocument();
    expect(screen.getByText('3 items')).toBeInTheDocument();
    expect(screen.getByText('Rp 7.000.000')).toBeInTheDocument();

    expect(screen.getByText('Graduation Solo Portrait')).toBeInTheDocument();
    expect(screen.getByText('1 item')).toBeInTheDocument();
    expect(screen.getAllByText('Rp 1.500.000').length).toBeGreaterThan(0);
  });

  it('triggers duplicate package RPC on duplicate button click (CAT-REQ-007)', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockPackagesList) as never);
    vi.mocked(supabase.rpc).mockImplementation((fn: string) => {
      if (fn === 'duplicate_package') {
        return Promise.resolve({ data: 'pkg_cloned_999', error: null }) as never;
      }
      return Promise.resolve({ data: [mockWorkspaceRow], error: null }) as never;
    });

    renderPackagesList();

    const duplicateBtn = await screen.findByTestId('duplicate-package-pkg_wedding_123');
    fireEvent.click(duplicateBtn);

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith(
        'duplicate_package',
        expect.objectContaining({
          p_workspace_id: 'ws_test_456',
          p_package_id: 'pkg_wedding_123',
        })
      );
    });
  });

  it('renders empty state when no packages exist', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder([]) as never);
    renderPackagesList();

    expect(await screen.findByTestId('packages-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No packages in catalog yet')).toBeInTheDocument();

    const createBtn = screen.getByTestId('empty-create-package-btn');
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByTestId('new-package-page')).toBeInTheDocument();
    });
  });
});
