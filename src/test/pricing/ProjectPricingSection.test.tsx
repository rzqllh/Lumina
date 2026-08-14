import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProjectDetailRoute } from '@/routes/projects/ProjectDetailRoute';
import { supabase } from '@/lib/supabase';
import { mockSession, mockWorkspaceRow } from '../auth/authMocks';
import { mockProjectServices, mockProjectId } from './pricingMocks';

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

const mockProject = {
  id: mockProjectId,
  workspace_id: 'ws_test_456',
  client_id: 'client_001',
  title: 'Wedding Alex & Budi',
  project_number: '#W2026-001',
  status: 'active',
  currency: 'IDR',
  client_approved_at: null,
  closed_at: null,
  force_closed_at: null,
  force_close_reason: null,
  reopened_at: null,
  created_at: '2026-08-14T00:00:00Z',
  updated_at: '2026-08-14T00:00:00Z',
  client: {
    id: 'client_001',
    display_name: 'Alex & Budi',
    client_type: 'couple',
    email: 'alex@example.com',
    phone: null,
    custom_type_label: null,
  },
};

describe('ProjectPricingSection (F-PRICING-001)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as never);

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [mockWorkspaceRow],
      error: null,
    } as never);
  });

  function createFromMock(returnsByTable: Record<string, unknown>) {
    return (table: string) => {
      const data = returnsByTable[table] ?? null;
      const builder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data, error: null }),
        then: (resolve: (val: { data: unknown; error: null }) => unknown) =>
          Promise.resolve({ data, error: null }).then(resolve),
      };
      return builder;
    };
  }

  function renderProjectDetail() {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={[`/projects/${mockProjectId}`]}>
              <Routes>
                <Route
                  path="/projects/:projectId"
                  element={
                    <ProtectedRoute>
                      <ProjectDetailRoute />
                    </ProtectedRoute>
                  }
                />
                <Route path="/projects/:projectId/edit" element={<div>Edit</div>} />
                <Route path="/clients/:clientId" element={<div>Client</div>} />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  it('PRICE-REQ-001: renders all project service rows with correct labels', async () => {
    vi.mocked(supabase.from).mockImplementation(
      createFromMock({
        projects: mockProject,
        project_services: mockProjectServices,
        services: [],
      }) as never
    );

    renderProjectDetail();

    expect(await screen.findByText('Wedding Photography (Full Day)')).toBeInTheDocument();
    expect(screen.getByText('Cinematic Videography')).toBeInTheDocument();
    expect(screen.getByText('Custom Drone Coverage')).toBeInTheDocument();
  });

  it('PRICE-REQ-001: renders Project Value correctly summing all net line totals', async () => {
    vi.mocked(supabase.from).mockImplementation(
      createFromMock({
        projects: mockProject,
        project_services: mockProjectServices,
        services: [],
      }) as never
    );

    renderProjectDetail();

    // Expected: 2500000 + 3000000 + 1500000 = 7000000
    expect(await screen.findByTestId('project-value-total')).toBeInTheDocument();
    expect(screen.getByTestId('project-value-total')).toHaveTextContent('Rp 7.000.000');
  });

  it('PRICE-REQ-001: renders empty state with CTAs when no project services exist', async () => {
    vi.mocked(supabase.from).mockImplementation(
      createFromMock({
        projects: mockProject,
        project_services: [],
        services: [],
      }) as never
    );

    renderProjectDetail();

    expect(await screen.findByTestId('pricing-empty')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state-add-service')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state-apply-package')).toBeInTheDocument();
  });

  it('PRICE-REQ-005: opens Edit form when Edit button is clicked', async () => {
    vi.mocked(supabase.from).mockImplementation(
      createFromMock({
        projects: mockProject,
        project_services: mockProjectServices,
        services: [],
      }) as never
    );

    renderProjectDetail();

    const editBtn = await screen.findByTestId(`edit-project-service-${mockProjectServices[0].id}`);
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByTestId('ps-form-submit-btn')).toBeInTheDocument();
    });

    // The form should say "Update Service"
    expect(screen.getByTestId('ps-form-submit-btn')).toHaveTextContent('Update Service');
  });

  it('PRICE-REQ-006: opens Remove confirmation when Remove button is clicked', async () => {
    vi.mocked(supabase.from).mockImplementation(
      createFromMock({
        projects: mockProject,
        project_services: mockProjectServices,
        services: [],
      }) as never
    );

    renderProjectDetail();

    const removeBtn = await screen.findByTestId(
      `remove-project-service-${mockProjectServices[0].id}`
    );
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-remove-btn')).toBeInTheDocument();
    });

    expect(screen.getByText('Remove service?')).toBeInTheDocument();
  });

  it('PRICE-REQ-002: opens Add Service form from header CTA', async () => {
    vi.mocked(supabase.from).mockImplementation(
      createFromMock({
        projects: mockProject,
        project_services: mockProjectServices,
        services: [],
      }) as never
    );

    renderProjectDetail();

    const addBtn = await screen.findByTestId('add-service-cta');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByTestId('ps-form-submit-btn')).toHaveTextContent('Add Service');
    });
  });

  it('PRICE-REQ-004: opens Package Picker from Apply Package CTA', async () => {
    vi.mocked(supabase.from).mockImplementation(
      createFromMock({
        projects: mockProject,
        project_services: mockProjectServices,
        services: [],
        packages: [],
      }) as never
    );

    renderProjectDetail();

    const applyBtn = await screen.findByTestId('apply-package-cta');
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(screen.getByTestId('package-picker-modal')).toBeInTheDocument();
    });
  });

  it('renders loading state for project services', async () => {
    let resolveQuery: () => void;
    const blockingPromise = new Promise<void>((resolve) => {
      resolveQuery = resolve;
    });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'projects') {
        return createFromMock({ projects: mockProject })('projects') as never;
      }
      const builder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: () => blockingPromise.then(() => ({ data: [], error: null })),
      };
      return builder as never;
    });

    renderProjectDetail();

    // Wait for project to load, then pricing should show skeleton
    await screen.findByText('Pricing & Services');
    expect(screen.queryByTestId('pricing-loading')).toBeInTheDocument();

    resolveQuery!();
  });
});
