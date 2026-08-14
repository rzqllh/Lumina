import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ServiceNewRoute } from '@/routes/catalog/ServiceNewRoute';
import { supabase } from '@/lib/supabase';
import { mockSession, mockWorkspaceRow } from '../auth/authMocks';
import { createMockQueryBuilder } from './catalogMocks';

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

describe('ServiceNewRoute (CAT-REQ-002)', () => {
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

  function renderServiceNew() {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={['/services/new']}>
              <Routes>
                <Route
                  path="/services/new"
                  element={
                    <ProtectedRoute>
                      <ServiceNewRoute />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/services"
                  element={<div data-testid="services-list-page">Services List Page</div>}
                />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  it('validates service label is required and creates service on submit', async () => {
    const servicesBuilder = createMockQueryBuilder({
      id: 'srv_new_123',
      label: 'Express Photo Editing',
      default_unit_price: 500000,
    });

    vi.mocked(supabase.from).mockReturnValue(servicesBuilder as never);

    renderServiceNew();

    const submitBtn = await screen.findByTestId('service-submit-btn');
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText('Service label must be at least 2 characters')
    ).toBeInTheDocument();

    const labelInput = screen.getByLabelText(/service name/i);
    const priceInput = screen.getByLabelText(/default unit price/i);

    fireEvent.change(labelInput, { target: { value: 'Express Photo Editing' } });
    fireEvent.change(priceInput, { target: { value: '500000' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(servicesBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          workspace_id: 'ws_test_456',
          label: 'Express Photo Editing',
          default_unit_price: 500000,
        })
      );
      expect(screen.getByTestId('services-list-page')).toBeInTheDocument();
    });
  });
});
