import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PackageEditRoute } from '@/routes/catalog/PackageEditRoute';
import { supabase } from '@/lib/supabase';
import { mockSession, mockWorkspaceRow } from '../auth/authMocks';
import { mockServicesList, mockPackagesList, createMockQueryBuilder } from './catalogMocks';

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

describe('PackageEditRoute (CAT-REQ-005 / CAT-REQ-006)', () => {
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

  function renderPackageEdit() {
    const servicesBuilder = createMockQueryBuilder(mockServicesList);
    const packagesBuilder = createMockQueryBuilder(mockPackagesList[0]);
    const itemsBuilder = createMockQueryBuilder([]);

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'services') return servicesBuilder as never;
      if (table === 'packages') return packagesBuilder as never;
      if (table === 'package_items') return itemsBuilder as never;
      return createMockQueryBuilder() as never;
    });

    return {
      packagesBuilder,
      itemsBuilder,
      ...render(
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <WorkspaceProvider>
              <MemoryRouter initialEntries={['/packages/pkg_wedding_123/edit']}>
                <Routes>
                  <Route
                    path="/packages/:packageId/edit"
                    element={
                      <ProtectedRoute>
                        <PackageEditRoute />
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
      ),
    };
  }

  it('pre-populates package items and updates on submit', async () => {
    const { packagesBuilder, itemsBuilder } = renderPackageEdit();

    const nameInput = await screen.findByDisplayValue('Wedding Full Day Deluxe');
    expect(nameInput).toBeInTheDocument();

    expect(screen.getByDisplayValue('Lead Photography (Full Day)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cinematic Videography')).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: 'Wedding Full Day Deluxe 2026' } });

    // Remove the 3rd item (index 2)
    const removeBtn2 = screen.getByTestId('remove-item-2');
    fireEvent.click(removeBtn2);

    // Total should update (7.0M - 1.0M = 6.0M)
    expect(screen.getByTestId('package-calculated-total')).toHaveTextContent('Rp 6.000.000');

    const submitBtn = screen.getByTestId('package-submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(packagesBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Wedding Full Day Deluxe 2026',
        })
      );
      expect(itemsBuilder.delete).toHaveBeenCalled();
      expect(screen.getByTestId('packages-list-page')).toBeInTheDocument();
    });
  });
});
