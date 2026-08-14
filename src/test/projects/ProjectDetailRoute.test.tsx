import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, WorkspaceProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProjectDetailRoute } from '@/routes/projects/ProjectDetailRoute';
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

describe('ProjectDetailRoute (PROJ-REQ-004 / WORKFLOW-REQ-002)', () => {
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

  function renderProjectDetail() {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <MemoryRouter initialEntries={['/projects/proj_wedding_123']}>
              <Routes>
                <Route
                  path="/projects/:projectId"
                  element={
                    <ProtectedRoute>
                      <ProjectDetailRoute />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:projectId/edit"
                  element={<div data-testid="edit-project-page">Edit Project Page</div>}
                />
              </Routes>
            </MemoryRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  it('renders project overview metadata and default Workflow & Tasks tab without mounting inactive sections', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'projects') {
        return createMockQueryBuilder(mockProjectList[0]) as never;
      }
      if (table === 'briefs') {
        return createMockQueryBuilder({
          id: 'brief-1',
          workspace_id: 'ws_wedding_123',
          project_id: 'proj_wedding_123',
          title: 'Sarah & Dave Brief',
          sections: [],
        }) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderProjectDetail();

    expect(await screen.findByText('Sarah & Dave Bali Wedding')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('PRJ-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Sarah & Dave Wedding')).toBeInTheDocument();
    expect(screen.getByText('IDR')).toBeInTheDocument();

    // Default tab is "Workflow & Tasks" (Feature #6)
    expect(screen.getByText('Production Workflow')).toBeInTheDocument();
    expect(screen.getByText('Action Items & Tasks')).toBeInTheDocument();

    // Project Completion & Closure Gate (Feature #9)
    expect(screen.getByTestId('project-closure-control')).toBeInTheDocument();

    // Inactive sections are NOT mounted on initial load (proving query reduction)
    expect(screen.queryByTestId('financial-summary-card')).not.toBeInTheDocument();
    expect(screen.queryByText('Production Sessions')).not.toBeInTheDocument();
    expect(screen.queryByText('Project Deliverables')).not.toBeInTheDocument();
    expect(screen.queryByText('Project Creative Brief & Client Intake')).not.toBeInTheDocument();

    // Clicking "All Overview" mounts all sections
    const allTab = screen.getByTestId('tab-all-sections');
    fireEvent.click(allTab);

    expect(await screen.findByTestId('financial-summary-card')).toBeInTheDocument();
    expect(screen.getByText('Production Sessions')).toBeInTheDocument();
    expect(screen.getByText('Project Deliverables')).toBeInTheDocument();
  });

  it('navigates to edit project route when Edit Project is clicked', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'projects') {
        return createMockQueryBuilder(mockProjectList[0]) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderProjectDetail();

    const editBtn = await screen.findByTestId('edit-project-btn');
    fireEvent.click(editBtn);

    expect(screen.getByTestId('edit-project-page')).toBeInTheDocument();
  });

  it('filters visible sections when a navigation tab is selected', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'projects') {
        return createMockQueryBuilder(mockProjectList[0]) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderProjectDetail();

    // Initial default tab is "Workflow & Tasks"
    expect(await screen.findByText('Production Workflow')).toBeInTheDocument();
    expect(screen.queryByTestId('financial-summary-card')).not.toBeInTheDocument();

    // Click "Pricing & Finance" tab
    const financeTab = screen.getByTestId('tab-finance');
    fireEvent.click(financeTab);

    expect(await screen.findByTestId('financial-summary-card')).toBeInTheDocument();
    expect(screen.queryByText('Production Workflow')).not.toBeInTheDocument();

    // Click "Sessions & Deliverables" tab
    const sessionsTab = screen.getByTestId('tab-sessions');
    fireEvent.click(sessionsTab);

    expect(await screen.findByText('Production Sessions')).toBeInTheDocument();
    expect(screen.getByText('Project Deliverables')).toBeInTheDocument();
    expect(screen.queryByTestId('financial-summary-card')).not.toBeInTheDocument();
  });
});
