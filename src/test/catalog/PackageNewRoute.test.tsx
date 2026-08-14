import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PackageNewRoute } from '@/routes/catalog/PackageNewRoute';
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

describe('PackageNewRoute (CAT-REQ-005 / CAT-REQ-006 / CAT-REQ-008)', () => {
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

  function renderPackageNew() {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={['/packages/new']}>
              <Routes>
                <Route
                  path="/packages/new"
                  element={
                    <ProtectedRoute>
                      <PackageNewRoute />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/packages"
                  element={<div data-testid="packages-list-page">Packages List Page</div>}
                />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  it('calculates package total dynamically and creates package on submit', async () => {
    const servicesBuilder = createMockQueryBuilder(mockServicesList);
    const packagesBuilder = createMockQueryBuilder({
      id: 'pkg_new_123',
      name: 'Engagement Photo & Video Combo',
    });
    const itemsBuilder = createMockQueryBuilder([]);

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'services') return servicesBuilder as never;
      if (table === 'packages') return packagesBuilder as never;
      if (table === 'package_items') return itemsBuilder as never;
      return createMockQueryBuilder() as never;
    });

    renderPackageNew();

    const nameInput = await screen.findByLabelText(/package preset name/i);
    expect(nameInput).toBeInTheDocument();

    // Wait for services query to populate options
    await screen.findByText(/Lead Photography/i);

    fireEvent.change(nameInput, { target: { value: 'Engagement Photo & Video Combo' } });

    // Pick service from template dropdown on item 0
    const serviceSelect = screen.getByTestId('service-select-0');
    fireEvent.change(serviceSelect, { target: { value: mockServicesList[0].id } });

    // Expect label and unit price to be filled automatically
    expect(await screen.findByDisplayValue('Lead Photography (Full Day)')).toBeInTheDocument();

    // Live total should reflect Rp 2.500.000
    expect(screen.getByTestId('package-calculated-total')).toHaveTextContent('Rp 2.500.000');

    // Add another item
    const addItemBtn = screen.getByTestId('add-item-btn');
    fireEvent.click(addItemBtn);

    // Pick second service
    const serviceSelect1 = await screen.findByTestId('service-select-1');
    fireEvent.change(serviceSelect1, { target: { value: mockServicesList[1].id } });

    // Live total should now be 2.5M + 3.5M = 6.0M
    expect(screen.getByTestId('package-calculated-total')).toHaveTextContent('Rp 6.000.000');

    const submitBtn = screen.getByTestId('package-submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(packagesBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          workspace_id: 'ws_test_456',
          name: 'Engagement Photo & Video Combo',
        })
      );
      expect(itemsBuilder.insert).toHaveBeenCalled();
      expect(screen.getByTestId('packages-list-page')).toBeInTheDocument();
    });
  });
});
