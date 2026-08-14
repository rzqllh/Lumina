import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectDeliverablesSection } from '@/features/deliverables/components/ProjectDeliverablesSection';
import { supabase } from '@/lib/supabase';
import type { Deliverable } from '@/features/deliverables/types';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

const mockDeliverables: Deliverable[] = [
  {
    id: 'deliv-1',
    workspace_id: 'ws-123',
    project_id: 'proj-456',
    label: '50 Edited High-Res Photos',
    quantity: 50,
    type_label: 'Photos',
    deadline: '2026-10-01',
    status: 'delivered',
    notes: 'Color graded in Rec.709',
    revisions: [
      {
        id: 'rev-1',
        workspace_id: 'ws-123',
        deliverable_id: 'deliv-1',
        revision_number: 1,
        requested_date: '2026-09-25',
        due_date: '2026-09-28',
        feedback: 'Make photo #12 warmer and crop photo #35',
        status: 'delivered',
        delivered_date: '2026-09-27',
        notes: null,
        created_at: '2026-09-25T10:00:00Z',
        updated_at: '2026-09-27T14:00:00Z',
      },
    ],
    created_at: '2026-08-14T01:00:00Z',
    updated_at: '2026-08-14T01:00:00Z',
  },
  {
    id: 'deliv-2',
    workspace_id: 'ws-123',
    project_id: 'proj-456',
    label: '3-Min 4K Cinematic Highlight Reel',
    quantity: 1,
    type_label: 'Video',
    deadline: '2026-10-15',
    status: 'approved',
    notes: 'Final master export',
    revisions: [],
    created_at: '2026-08-14T02:00:00Z',
    updated_at: '2026-08-14T02:00:00Z',
  },
];

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

describe('ProjectDeliverablesSection (DELIV-REQ-001 / DELIV-REQ-004 / DELIV-REQ-006)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  function renderSection(isForceClosed = false) {
    return render(
      <QueryClientProvider client={queryClient}>
        <ProjectDeliverablesSection
          workspaceId="ws-123"
          projectId="proj-456"
          isForceClosed={isForceClosed}
        />
      </QueryClientProvider>
    );
  }

  it('renders deliverables list with quantity, type badges, deadlines, and revisions count', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockDeliverables) as never);

    renderSection();

    expect(await screen.findByText('50 Edited High-Res Photos')).toBeInTheDocument();
    expect(screen.getByText('Project Deliverables')).toBeInTheDocument();
    expect(screen.getByText('3-Min 4K Cinematic Highlight Reel')).toBeInTheDocument();

    // Badges & metadata
    expect(screen.getByText('Qty: 50')).toBeInTheDocument();
    expect(screen.getByText('Photos')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('1 rev')).toBeInTheDocument();
    expect(screen.getByText('(1 of 2 approved)')).toBeInTheDocument();
  });

  it('renders empty state when no deliverables exist', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder([]) as never);

    renderSection();

    expect(await screen.findByText('No deliverables added yet')).toBeInTheDocument();
    expect(screen.getByTestId('empty-add-deliverable-btn')).toBeInTheDocument();
  });

  it('disables mutation actions when project is force_closed', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockDeliverables) as never);

    renderSection(true); // isForceClosed = true

    expect(await screen.findByText('50 Edited High-Res Photos')).toBeInTheDocument();
    expect(screen.queryByTestId('add-deliverable-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('edit-deliv-deliv-1-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-deliv-deliv-1-btn')).not.toBeInTheDocument();
  });

  it('triggers approve deliverable status transition', async () => {
    const mockBuilder = createMockQueryBuilder(mockDeliverables);
    vi.mocked(supabase.from).mockReturnValue(mockBuilder as never);

    renderSection();

    const approveBtn = await screen.findByTestId('approve-deliv-deliv-1-btn');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('deliverables');
      expect(mockBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'approved' })
      );
    });
  });

  it('opens delete confirmation modal and executes deletion', async () => {
    const mockBuilder = createMockQueryBuilder(mockDeliverables);
    vi.mocked(supabase.from).mockReturnValue(mockBuilder as never);

    renderSection();

    const deleteBtn = await screen.findByTestId('delete-deliv-deliv-1-btn');
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Delete Deliverable?')).toBeInTheDocument();

    const confirmBtn = screen.getByTestId('confirm-delete-deliverable-btn');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('deliverables');
      expect(mockBuilder.delete).toHaveBeenCalled();
    });
  });
});
