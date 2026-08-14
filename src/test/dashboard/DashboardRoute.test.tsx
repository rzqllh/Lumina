import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router';
import { DashboardRoute } from '@/routes/dashboard/DashboardRoute';
import { supabase } from '@/lib/supabase';
import { useWorkspace, useAuth } from '@/lib/auth';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  useWorkspace: vi.fn(),
  useAuth: vi.fn(),
}));

const mockActiveProjects = [
  {
    id: 'proj-1',
    workspace_id: 'ws-123',
    client_id: 'cli-1',
    title: 'Sarah & Dave Wedding',
    project_number: 'PRJ-2026-001',
    status: 'active',
    currency: 'IDR',
    client: { display_name: 'Sarah Jenkins' },
  },
];

function createMockQueryBuilder(data: unknown = null, error: unknown = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: (resolve: (val: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve({ data, error }).then(resolve),
  };
  return builder;
}

describe('DashboardRoute (DASH-REQ-001 / DASH-REQ-002 / DASH-REQ-003 / DASH-REQ-004)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.mocked(useWorkspace).mockReturnValue({
      workspaceId: 'ws-123',
      currentWorkspace: { id: 'ws-123', name: 'Lumina Studio' },
    } as never);

    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'operator@lumina.app', user_metadata: { full_name: 'Alex Creator' } },
    } as never);
  });

  function renderDashboard() {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<DashboardRoute />} />
            <Route path="/projects/new" element={<div>Create Project Page</div>} />
            <Route path="/clients/new" element={<div>Create Client Page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  it('renders dashboard with greetings, metrics, attention panel, today agenda, and active projects', async () => {
    const queriedTables: string[] = [];

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      queriedTables.push(table);
      if (table === 'projects') {
        return createMockQueryBuilder(mockActiveProjects) as never;
      }
      if (table === 'project_services') {
        return createMockQueryBuilder([
          {
            id: 'ps-1',
            project_id: 'proj-1',
            unit_price: 10000000,
            quantity: 1,
            subtotal: 10000000,
            adjustment_amount: 0,
          },
        ]) as never;
      }
      if (table === 'payments') {
        return createMockQueryBuilder([
          { id: 'pay-1', project_id: 'proj-1', amount: 2000000, status: 'paid' },
        ]) as never;
      }
      if (table === 'tasks') {
        return createMockQueryBuilder([
          {
            id: 'task-1',
            project_id: 'proj-1',
            title: 'Color grading pass',
            status: 'open',
            due_date: new Date().toISOString().split('T')[0],
          },
        ]) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderDashboard();

    expect(await screen.findByText(/Welcome back, Alex Creator/i)).toBeInTheDocument();
    expect(await screen.findByTestId('workspace-metrics-grid')).toBeInTheDocument();
    expect(await screen.findByTestId('needs-attention-panel')).toBeInTheDocument();
    expect(await screen.findByTestId('today-agenda-panel')).toBeInTheDocument();
    expect(await screen.findByTestId('active-projects-panel')).toBeInTheDocument();
    expect(await screen.findByTestId('upcoming-sessions-panel')).toBeInTheDocument();
    expect(screen.getByText('Sarah & Dave Wedding')).toBeInTheDocument();

    // Verify canonical table 'tasks' is queried (and NOT 'project_tasks')
    expect(queriedTables).toContain('tasks');
    expect(queriedTables).not.toContain('project_tasks');
    expect(queriedTables).toContain('project_services');
  });

  it('navigates to create project when New Project shortcut is clicked', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder([]) as never);

    renderDashboard();

    const newProjectBtn = await screen.findByTestId('quick-action-new-project');
    fireEvent.click(newProjectBtn);

    expect(screen.getByText('Create Project Page')).toBeInTheDocument();
  });
});
