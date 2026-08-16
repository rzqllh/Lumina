import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProjectNewRoute } from '@/routes/projects/ProjectNewRoute';
import { supabase } from '@/lib/supabase';
import { mockSession, mockWorkspaceRow } from '../auth/authMocks';
import { mockClientList } from '../clients/clientsMocks';
import { createMockQueryBuilder } from './projectsMocks';

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

describe('ProjectNewRoute (PROJ-REQ-002 / PROJ-REQ-007)', () => {
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

  function renderProjectNew() {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={['/projects/new']}>
              <Routes>
                <Route
                  path="/projects/new"
                  element={
                    <ProtectedRoute>
                      <ProjectNewRoute />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:projectId"
                  element={<div data-testid="project-detail-page">Project Detail Page</div>}
                />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  it('validates project title and client selection are required', async () => {
    const clientsBuilder = createMockQueryBuilder([mockClientList[0]]);
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'clients') return clientsBuilder as never;
      return createMockQueryBuilder() as never;
    });

    renderProjectNew();

    const submitBtn = await screen.findByTestId('project-submit-btn');
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText('Project title must be at least 2 characters')
    ).toBeInTheDocument();
    expect(screen.getByText('Please select a valid client from the dropdown')).toBeInTheDocument();
  });

  it('creates project and redirects to detail page on valid submission (PROJ-REQ-002)', async () => {
    const clientsBuilder = createMockQueryBuilder([mockClientList[0]]);
    const projectsBuilder = createMockQueryBuilder({
      id: 'proj_new_999',
      title: 'Elena & Mark Lake Como Wedding',
    });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'clients') return clientsBuilder as never;
      if (table === 'projects') return projectsBuilder as never;
      return createMockQueryBuilder() as never;
    });

    renderProjectNew();

    const titleInput = await screen.findByLabelText(/project title/i);
    const clientSelect = await screen.findByTestId('project-client-select');
    const submitBtn = screen.getByTestId('project-submit-btn');

    fireEvent.change(titleInput, { target: { value: 'Elena & Mark Lake Como Wedding' } });
    fireEvent.change(clientSelect, { target: { value: mockClientList[0].id } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(projectsBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          workspace_id: 'ws_test_456',
          client_id: mockClientList[0].id,
          title: 'Elena & Mark Lake Como Wedding',
        })
      );
      expect(screen.getByTestId('project-detail-page')).toBeInTheDocument();
    });
  });

  it('preselects client from clientId query parameter', async () => {
    const clientsBuilder = createMockQueryBuilder([mockClientList[0]]);
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'clients') return clientsBuilder as never;
      return createMockQueryBuilder() as never;
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={[`/projects/new?clientId=${mockClientList[0].id}`]}>
              <Routes>
                <Route
                  path="/projects/new"
                  element={
                    <ProtectedRoute>
                      <ProjectNewRoute />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );

    const clientSelect = (await screen.findByTestId('project-client-select')) as HTMLSelectElement;
    expect(clientSelect.value).toBe(mockClientList[0].id);
  });
});
