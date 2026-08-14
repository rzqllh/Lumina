import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectSessionsSection } from '@/features/sessions/components/ProjectSessionsSection';
import { supabase } from '@/lib/supabase';
import type { Session } from '@/features/sessions/types';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockSessions: Session[] = [
  {
    id: 'sess-1',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    type: 'shoot',
    custom_type_label: null,
    title: 'Pre-wedding Sunset Shoot',
    date: '2026-09-15',
    start_time: '15:30:00',
    end_time: '18:30:00',
    location: 'Tanjung Lesung Beach',
    notes: 'Bring golden hour filters',
    status: 'scheduled',
    google_calendar_event_id: null,
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
  },
  {
    id: 'sess-2',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    type: 'meeting',
    custom_type_label: null,
    title: 'Moodboard & Timeline Review',
    date: '2026-09-01',
    start_time: '10:00:00',
    end_time: '11:30:00',
    location: 'Studio Coffee Bandung',
    notes: null,
    status: 'completed',
    google_calendar_event_id: null,
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
  },
  {
    id: 'sess-3',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    type: 'custom',
    custom_type_label: 'Wardrobe Fitting',
    title: 'Gown & Suit Tryout',
    date: '2026-08-28',
    start_time: null,
    end_time: null,
    location: 'Bridal Boutique',
    notes: null,
    status: 'cancelled',
    google_calendar_event_id: null,
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

describe('ProjectSessionsSection (SESS-REQ-001 / SESS-REQ-004)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it('renders session list with count badge and details', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockSessions) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectSessionsSection workspaceId="ws-1" projectId="proj-1" />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Pre-wedding Sunset Shoot')).toBeInTheDocument();
    expect(screen.getByText('Moodboard & Timeline Review')).toBeInTheDocument();
    expect(screen.getByText('Gown & Suit Tryout')).toBeInTheDocument();
    expect(screen.getByTestId('sessions-count-badge')).toHaveTextContent('3');
    expect(screen.getByText('Tanjung Lesung Beach')).toBeInTheDocument();
    expect(screen.getByText('Wardrobe Fitting')).toBeInTheDocument();
  });

  it('allows marking a scheduled session as completed', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockSessions) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectSessionsSection workspaceId="ws-1" projectId="proj-1" />
      </QueryClientProvider>
    );

    const completeBtn = await screen.findByTestId('session-complete-btn-sess-1');
    fireEvent.click(completeBtn);

    expect(supabase.from).toHaveBeenCalledWith('sessions');
  });

  it('allows reopening a completed session', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockSessions) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectSessionsSection workspaceId="ws-1" projectId="proj-1" />
      </QueryClientProvider>
    );

    const reopenBtn = await screen.findByTestId('session-reopen-btn-sess-2');
    fireEvent.click(reopenBtn);

    expect(supabase.from).toHaveBeenCalledWith('sessions');
  });

  it('opens add session modal when clicking Add Session button', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockSessions) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectSessionsSection workspaceId="ws-1" projectId="proj-1" />
      </QueryClientProvider>
    );

    const addBtn = await screen.findByTestId('add-session-btn');
    fireEvent.click(addBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Schedule New Session/i })).toBeInTheDocument();
  });

  it('opens delete confirmation modal and executes deletion', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockSessions) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectSessionsSection workspaceId="ws-1" projectId="proj-1" />
      </QueryClientProvider>
    );

    const deleteBtn = await screen.findByTestId('session-delete-btn-sess-1');
    fireEvent.click(deleteBtn);

    expect(screen.getByRole('heading', { name: /Delete Session\?/i })).toBeInTheDocument();
    const confirmBtn = screen.getByTestId('confirm-delete-session-btn');
    fireEvent.click(confirmBtn);

    expect(supabase.from).toHaveBeenCalledWith('sessions');
  });

  it('hides add session button and card action buttons when isForceClosed is true', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockSessions) as never);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectSessionsSection workspaceId="ws-1" projectId="proj-1" isForceClosed={true} />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Pre-wedding Sunset Shoot')).toBeInTheDocument();
    expect(screen.queryByTestId('add-session-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('session-complete-btn-sess-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('session-edit-btn-sess-1')).not.toBeInTheDocument();
  });
});
