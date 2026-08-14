import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectTasksSection } from '@/features/project-workflow/components/ProjectTasksSection';
import { supabase } from '@/lib/supabase';
import type { ProjectWorkflowStage, Task } from '@/features/project-workflow/types';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

const mockStages: ProjectWorkflowStage[] = [
  {
    id: 'stg-1',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    label: 'Preparation',
    position: 0,
    status: 'completed',
    source_template_id: null,
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
  },
  {
    id: 'stg-2',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    label: 'Post-Production',
    position: 1,
    status: 'active',
    source_template_id: null,
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
  },
];

const mockTasks: Task[] = [
  {
    id: 'task-1',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    stage_id: 'stg-1',
    deliverable_id: null,
    title: 'Confirm shotlist with client',
    due_date: '2026-08-20',
    status: 'done',
    notes: 'Include bridal party requested portraits',
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
    stage: mockStages[0],
  },
  {
    id: 'task-2',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    stage_id: 'stg-2',
    deliverable_id: null,
    title: 'Color grade highlight reel',
    due_date: '2026-08-25',
    status: 'open',
    notes: null,
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
    stage: mockStages[1],
  },
  {
    id: 'task-3',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    stage_id: null,
    deliverable_id: null,
    title: 'Send invoice receipt',
    due_date: null,
    status: 'open',
    notes: null,
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
    stage: null,
  },
];

function createMockQueryBuilder(data: unknown) {
  const builder: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => Promise.resolve({ data, error: null })),
    then: (resolve: (val: unknown) => unknown) =>
      Promise.resolve({ data, error: null }).then(resolve),
  };
  return builder;
}

describe('ProjectTasksSection (WORKFLOW-REQ-007 / WORKFLOW-REQ-008 / WORKFLOW-REQ-009)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it('renders task list with progress summary and stage pills', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockTasks) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectTasksSection workspaceId="ws-1" projectId="proj-1" stages={mockStages} />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Confirm shotlist with client')).toBeInTheDocument();
    expect(screen.getByText('Color grade highlight reel')).toBeInTheDocument();
    expect(screen.getByText('Send invoice receipt')).toBeInTheDocument();
    expect(screen.getByText('1 of 3 done')).toBeInTheDocument();
  });

  it('toggles task completion status', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockTasks) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectTasksSection workspaceId="ws-1" projectId="proj-1" stages={mockStages} />
      </QueryClientProvider>
    );

    const toggleBtns = await screen.findAllByRole('checkbox');
    fireEvent.click(toggleBtns[1]); // Toggle task-2 to done

    expect(supabase.from).toHaveBeenCalledWith('tasks');
  });

  it('filters tasks by stage pill click', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockTasks) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectTasksSection workspaceId="ws-1" projectId="proj-1" stages={mockStages} />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Confirm shotlist with client')).toBeInTheDocument();

    // Click 'Post-Production' stage tab filter
    const stageTab = screen.getByRole('button', { name: /Post-Production/i });
    fireEvent.click(stageTab);

    // task-1 is in Preparation so it should not be in filtered list
    expect(screen.queryByText('Confirm shotlist with client')).not.toBeInTheDocument();
    expect(screen.getByText('Color grade highlight reel')).toBeInTheDocument();
  });

  it('opens add task modal when clicking Add Task button', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockTasks) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectTasksSection workspaceId="ws-1" projectId="proj-1" stages={mockStages} />
      </QueryClientProvider>
    );

    const addBtn = await screen.findByRole('button', { name: /add task/i });
    fireEvent.click(addBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Send moodboard/i)).toBeInTheDocument();
  });
});
