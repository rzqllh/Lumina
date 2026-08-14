import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectFinancialsSection } from '@/features/finance/components/ProjectFinancialsSection';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

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

describe('ProjectFinancialsSection (FIN-REQ-003 / FIN-REQ-004 / FIN-REQ-005)', () => {
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

  function renderSection() {
    return render(
      <QueryClientProvider client={queryClient}>
        <ProjectFinancialsSection workspaceId="ws-123" projectId="proj-456" currency="IDR" />
      </QueryClientProvider>
    );
  }

  it('renders summary card and tab navigation', async () => {
    renderSection();

    expect(await screen.findByTestId('financial-summary-card')).toBeInTheDocument();
    expect(screen.getByTestId('tab-payments')).toBeInTheDocument();
    expect(screen.getByTestId('tab-expenses')).toBeInTheDocument();
    expect(screen.getByTestId('tab-collaborators')).toBeInTheDocument();
  });

  it('switches between tabs and displays empty states', () => {
    renderSection();

    // Payments Tab
    expect(screen.getByTestId('payments-list-container')).toBeInTheDocument();

    // Switch to Expenses Tab
    fireEvent.click(screen.getByTestId('tab-expenses'));
    expect(screen.getByTestId('expenses-list-container')).toBeInTheDocument();

    // Switch to Collaborators Tab
    fireEvent.click(screen.getByTestId('tab-collaborators'));
    expect(screen.getByTestId('collaborators-list-container')).toBeInTheDocument();
  });
});
