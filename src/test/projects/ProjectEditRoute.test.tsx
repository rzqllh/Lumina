import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProjectEditRoute } from '@/routes/projects/ProjectEditRoute';
import { supabase } from '@/lib/supabase';
import { mockSession, mockWorkspaceRow } from '../auth/authMocks';
import { mockClientList } from '../clients/clientsMocks';
import { mockProjectList, createMockQueryBuilder } from './projectsMocks';

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

describe('ProjectEditRoute (PROJ-REQ-005)', () => {
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
    const clientsBuilder = createMockQueryBuilder(mockClientList);
    const projectsBuilder = createMockQueryBuilder({
      ...mockProjectList[0],
      title: 'Sarah & Dave Bali Wedding Updated',
      status: 'archived',
    });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'clients') return clientsBuilder as never;
      if (table === 'projects') return projectsBuilder as never;
      return createMockQueryBuilder() as never;
    });

    return { projectsBuilder };
  }

  function renderProjectEdit() {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={['/projects/proj_wedding_123/edit']}>
              <Routes>
                <Route
                  path="/projects/:projectId/edit"
                  element={
                    <ProtectedRoute>
                      <ProjectEditRoute />
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

  it('pre-populates existing values and updates project on submission (PROJ-REQ-005)', async () => {
    const { projectsBuilder } = setupEditMocks();
    renderProjectEdit();

    const titleInput = await screen.findByDisplayValue('Sarah & Dave Bali Wedding Updated');
    expect(titleInput).toBeInTheDocument();

    const numberInput = screen.getByDisplayValue('PRJ-2026-001');
    expect(numberInput).toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: 'Sarah & Dave Bali Wedding Final' } });

    const submitBtn = screen.getByRole('button', { name: 'Update Project' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(projectsBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sarah & Dave Bali Wedding Final',
        })
      );
      expect(screen.getByTestId('project-detail-page')).toBeInTheDocument();
    });
  });
});
