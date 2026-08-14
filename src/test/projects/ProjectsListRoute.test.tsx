import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProjectsListRoute } from '@/routes/projects/ProjectsListRoute';
import { supabase } from '@/lib/supabase';
import { mockSession, mockWorkspaceRow } from '../auth/authMocks';
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

describe('ProjectsListRoute (PROJ-REQ-001 / PROJ-REQ-008)', () => {
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

  function renderProjectsList() {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={['/projects']}>
              <Routes>
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <ProjectsListRoute />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/new"
                  element={<div data-testid="new-project-page">New Project Page</div>}
                />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  it('renders projects list with cards, client info, and status badges (PROJ-REQ-001)', async () => {
    vi.mocked(supabase.from).mockReturnValue(
      createMockQueryBuilder([mockProjectList[0], mockProjectList[1]]) as never
    );
    renderProjectsList();

    expect(await screen.findByText('Sarah & Dave Bali Wedding')).toBeInTheDocument();
    expect(screen.getByTestId('project-status-active')).toBeInTheDocument();
    expect(screen.getByText('Sarah & Dave Wedding')).toBeInTheDocument();
    expect(screen.getByText('PRJ-2026-001')).toBeInTheDocument();

    expect(screen.getByText('Nexus Tech Annual Keynote')).toBeInTheDocument();
    expect(screen.getByTestId('project-status-draft')).toBeInTheDocument();
    expect(screen.getByText('Nexus Tech Global')).toBeInTheDocument();
  });

  it('filters projects when searching by title or client name', async () => {
    vi.mocked(supabase.from).mockReturnValue(
      createMockQueryBuilder([mockProjectList[0], mockProjectList[1]]) as never
    );
    renderProjectsList();

    expect(await screen.findByText('Sarah & Dave Bali Wedding')).toBeInTheDocument();
    expect(screen.getByText('Nexus Tech Annual Keynote')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search projects/i);
    fireEvent.change(searchInput, { target: { value: 'Nexus' } });

    expect(screen.queryByText('Sarah & Dave Bali Wedding')).not.toBeInTheDocument();
    expect(screen.getByText('Nexus Tech Annual Keynote')).toBeInTheDocument();
  });

  it('renders empty state with Create Project action when no projects exist', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder([]) as never);
    renderProjectsList();

    expect(await screen.findByTestId('projects-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No projects in workspace yet')).toBeInTheDocument();

    const createBtn = screen.getByTestId('empty-create-project-btn');
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByTestId('new-project-page')).toBeInTheDocument();
    });
  });
});
