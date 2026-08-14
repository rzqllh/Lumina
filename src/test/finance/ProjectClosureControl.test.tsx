import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectClosureControl } from '@/features/finance/components/ProjectClosureControl';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/features/projects';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

const mockActiveProject: Project = {
  id: 'proj-123',
  workspace_id: 'ws-123',
  client_id: 'cli-123',
  title: 'Active Wedding Project',
  project_number: 'PRJ-2026-001',
  status: 'active',
  currency: 'IDR',
  client_approved_at: null,
  closed_at: null,
  force_closed_at: null,
  force_close_reason: null,
  reopened_at: null,
  created_at: '2026-08-14T01:00:00Z',
  updated_at: '2026-08-14T01:00:00Z',
};

const mockClosedProject: Project = {
  ...mockActiveProject,
  status: 'closed',
  closed_at: '2026-08-14T10:00:00Z',
};

const mockForceClosedProject: Project = {
  ...mockActiveProject,
  status: 'force_closed',
  force_closed_at: '2026-08-14T12:00:00Z',
  force_close_reason: 'Client defaulted on final balance',
};

function createMockQueryBuilder(data: unknown = null, error: unknown = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => Promise.resolve({ data, error })),
    then: (resolve: (val: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve({ data, error }).then(resolve),
  };
  return builder;
}

describe('ProjectClosureControl (FIN-REQ-006 / FIN-REQ-007 / FIN-REQ-008)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder([]) as never);
  });

  function renderControl(project: Project) {
    return render(
      <QueryClientProvider client={queryClient}>
        <ProjectClosureControl project={project} />
      </QueryClientProvider>
    );
  }

  it('renders closure controls for active project and opens force-close modal', async () => {
    renderControl(mockActiveProject);

    expect(screen.getByText('Project Completion & Closure')).toBeInTheDocument();
    const forceCloseBtn = screen.getByTestId('open-force-close-modal-btn');
    fireEvent.click(forceCloseBtn);

    expect(screen.getByRole('heading', { name: 'Force-Close Project' })).toBeInTheDocument();
  });

  it('submits force-close with written reason', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: mockForceClosedProject,
      error: null,
    } as never);

    renderControl(mockActiveProject);

    fireEvent.click(screen.getByTestId('open-force-close-modal-btn'));

    fireEvent.change(screen.getByLabelText(/Permanent Written Reason/i), {
      target: { value: 'Client bankruptcy and cancellation' },
    });

    fireEvent.click(screen.getByTestId('confirm-force-close-btn'));

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('force_close_project', {
        p_project_id: 'proj-123',
        p_reason: 'Client bankruptcy and cancellation',
      });
    });
  });

  it('renders closed banner when project is closed and allows reopening', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: mockActiveProject,
      error: null,
    } as never);

    renderControl(mockClosedProject);

    expect(screen.getByTestId('project-closed-banner')).toBeInTheDocument();
    expect(screen.getByText('Project Officially Closed')).toBeInTheDocument();

    const reopenBtn = screen.getByTestId('reopen-project-btn');
    fireEvent.click(reopenBtn);

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('reopen_project', {
        p_project_id: 'proj-123',
      });
    });
  });

  it('renders operational freeze banner when project is force-closed', () => {
    renderControl(mockForceClosedProject);

    expect(screen.getByTestId('project-force-closed-banner')).toBeInTheDocument();
    expect(screen.getByText(/Client defaulted on final balance/i)).toBeInTheDocument();
    expect(screen.getByTestId('reopen-force-closed-btn')).toBeInTheDocument();
  });
});
