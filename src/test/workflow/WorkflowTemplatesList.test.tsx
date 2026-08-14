import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkflowTemplatesList } from '@/features/workflow-templates';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

const mockTemplates = [
  {
    id: 'tmpl-1',
    workspace_id: 'ws-1',
    name: 'Wedding Standard',
    description: 'Comprehensive wedding day coverage',
    is_active: true,
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
    workflow_template_stages: [
      {
        id: 'stg-1',
        workflow_template_id: 'tmpl-1',
        label: 'Preparation',
        position: 0,
        created_at: '2026-08-14T00:00:00Z',
      },
      {
        id: 'stg-2',
        workflow_template_id: 'tmpl-1',
        label: 'Shoot Day',
        position: 1,
        created_at: '2026-08-14T00:00:00Z',
      },
      {
        id: 'stg-3',
        workflow_template_id: 'tmpl-1',
        label: 'Editing',
        position: 2,
        created_at: '2026-08-14T00:00:00Z',
      },
    ],
  },
  {
    id: 'tmpl-2',
    workspace_id: 'ws-1',
    name: 'Corporate Video',
    description: 'Corporate interview and event workflow',
    is_active: true,
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
    workflow_template_stages: [
      {
        id: 'stg-4',
        workflow_template_id: 'tmpl-2',
        label: 'Briefing',
        position: 0,
        created_at: '2026-08-14T00:00:00Z',
      },
      {
        id: 'stg-5',
        workflow_template_id: 'tmpl-2',
        label: 'Production',
        position: 1,
        created_at: '2026-08-14T00:00:00Z',
      },
    ],
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

describe('WorkflowTemplatesList (WORKFLOW-REQ-001)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it('renders templates with stage chips and descriptions', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockTemplates) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <WorkflowTemplatesList workspaceId="ws-1" />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Wedding Standard')).toBeInTheDocument();
    expect(screen.getByText('Corporate Video')).toBeInTheDocument();
    expect(screen.getByText('Preparation')).toBeInTheDocument();
    expect(screen.getByText('Shoot Day')).toBeInTheDocument();
    expect(screen.getByText('Editing')).toBeInTheDocument();
    expect(screen.getByText('3 stages')).toBeInTheDocument();
  });

  it('renders empty state when no templates exist', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder([]) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <WorkflowTemplatesList workspaceId="ws-1" />
      </QueryClientProvider>
    );

    expect(await screen.findByText('No workflow templates yet')).toBeInTheDocument();
    expect(screen.getByText('Create First Template')).toBeInTheDocument();
  });

  it('opens create modal when clicking New Workflow Template button', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockTemplates) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <WorkflowTemplatesList workspaceId="ws-1" />
      </QueryClientProvider>
    );

    const newBtn = await screen.findByRole('button', { name: /new workflow template/i });
    fireEvent.click(newBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Standard Wedding/i)).toBeInTheDocument();
  });

  it('filters templates using search input', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockTemplates) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <WorkflowTemplatesList workspaceId="ws-1" />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Wedding Standard')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search templates/i);
    fireEvent.change(searchInput, { target: { value: 'Corporate' } });

    expect(screen.queryByText('Wedding Standard')).not.toBeInTheDocument();
    expect(screen.getByText('Corporate Video')).toBeInTheDocument();
  });

  it('opens delete confirmation modal when clicking Delete', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockTemplates) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <WorkflowTemplatesList workspaceId="ws-1" />
      </QueryClientProvider>
    );

    const deleteBtns = await screen.findAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtns[0]);

    expect(screen.getByText('Delete Workflow Template?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
  });
});
