import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router';
import { CalendarRoute } from '@/routes/calendar/CalendarRoute';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/lib/auth';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  useWorkspace: vi.fn(),
}));

const mockSessions = [
  {
    id: 'ses-1',
    workspace_id: 'ws-123',
    project_id: 'proj-1',
    type: 'shoot',
    custom_type_label: null,
    title: 'Sunset Beach Portrait Session',
    date: '2026-08-14',
    start_time: '17:00:00',
    end_time: '19:00:00',
    location: 'Canggu Beach',
    status: 'scheduled',
    project: { title: 'Bali Wedding 2026' },
  },
];

function createMockQueryBuilder(data: unknown = null, error: unknown = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: (resolve: (val: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve({ data, error }).then(resolve),
  };
  return builder;
}

describe('CalendarRoute (DASH-REQ-005)', () => {
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
  });

  function renderCalendar() {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/calendar']}>
          <Routes>
            <Route path="/calendar" element={<CalendarRoute />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  it('renders production calendar in month view by default', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'sessions') {
        return createMockQueryBuilder(mockSessions) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderCalendar();

    expect(await screen.findByText('Schedule')).toBeInTheDocument();
    expect(await screen.findByTestId('calendar-month-view')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-filter-bar')).toBeInTheDocument();
  });

  it('switches between month view and agenda list view', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'sessions') {
        return createMockQueryBuilder(mockSessions) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderCalendar();

    const agendaToggle = await screen.findByTestId('view-agenda-btn');
    fireEvent.click(agendaToggle);

    expect(screen.getByTestId('calendar-agenda-view')).toBeInTheDocument();
    expect(screen.getByText('Sunset Beach Portrait Session')).toBeInTheDocument();
  });
});
