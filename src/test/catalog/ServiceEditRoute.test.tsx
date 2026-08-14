import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ServiceEditRoute } from '@/routes/catalog/ServiceEditRoute';
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

describe('ServiceEditRoute (CAT-REQ-002 / CAT-REQ-003)', () => {
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

  function renderServiceEdit() {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={['/services/srv_photo_123/edit']}>
              <Routes>
                <Route
                  path="/services/:serviceId/edit"
                  element={
                    <ProtectedRoute>
                      <ServiceEditRoute />
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

  it('pre-populates existing service and updates on submit', async () => {
    const servicesBuilder = createMockQueryBuilder(mockServicesList[0]);
    vi.mocked(supabase.from).mockReturnValue(servicesBuilder as never);

    renderServiceEdit();

    const labelInput = await screen.findByDisplayValue('Lead Photography (Full Day)');
    expect(labelInput).toBeInTheDocument();

    fireEvent.change(labelInput, { target: { value: 'Lead Photography (Full Day VIP)' } });

    const submitBtn = screen.getByTestId('service-submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(servicesBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Lead Photography (Full Day VIP)',
        })
      );
      expect(screen.getByTestId('services-list-page')).toBeInTheDocument();
    });
  });
});
