import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectWorkflowSection } from '@/features/project-workflow/components/ProjectWorkflowSection';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

const mockStages = [
  {
    id: 'stg-1',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    label: 'Pre-Production',
    position: 0,
    status: 'completed',
    source_template_id: 'tmpl-1',
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
  },
  {
    id: 'stg-2',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    label: 'Shoot Day',
    position: 1,
    status: 'active',
    source_template_id: 'tmpl-1',
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
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

describe('ProjectWorkflowSection (WORKFLOW-REQ-002 / WORKFLOW-REQ-003 / WORKFLOW-REQ-004)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it('renders section heading and stages when data is present', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockStages) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectWorkflowSection workspaceId="ws-1" projectId="proj-1" />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Pre-Production')).toBeInTheDocument();
    expect(screen.getByText('Shoot Day')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /customize/i })).toBeInTheDocument();
  });

  it('renders empty state when no stages exist', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder([]) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectWorkflowSection workspaceId="ws-1" projectId="proj-1" />
      </QueryClientProvider>
    );

    expect(await screen.findByText('No workflow stages added yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply workflow template/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add custom stage/i })).toBeInTheDocument();
  });

  it('opens customize modal when clicking Customize button', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockStages) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectWorkflowSection workspaceId="ws-1" projectId="proj-1" />
      </QueryClientProvider>
    );

    const customizeBtn = await screen.findByRole('button', { name: /customize/i });
    fireEvent.click(customizeBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Customize Project Workflow Stages')).toBeInTheDocument();
  });
});
