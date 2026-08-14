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

  it('renders project metadata, linked client card, pricing, workflow, and remaining placeholders', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockProjectList[0]) as never);

    renderProjectDetail();

    expect(await screen.findByText('Sarah & Dave Bali Wedding')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('PRJ-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Sarah & Dave Wedding')).toBeInTheDocument();
    expect(screen.getByText('IDR')).toBeInTheDocument();

    // Workflow & Tasks sections (Feature #6)
    expect(screen.getByText('Production Workflow')).toBeInTheDocument();
    expect(screen.getByText('Action Items & Tasks')).toBeInTheDocument();

    // Truthful placeholders for future milestones (Sessions #7, Deliverables #8)
    expect(screen.getByText(/Sessions — None scheduled yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Deliverables — None created yet/i)).toBeInTheDocument();
  });

  it('navigates to edit project route when Edit Project is clicked', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockProjectList[0]) as never);

    renderProjectDetail();

    const editBtn = await screen.findByTestId('edit-project-btn');
    fireEvent.click(editBtn);

    expect(screen.getByTestId('edit-project-page')).toBeInTheDocument();
  });
});
