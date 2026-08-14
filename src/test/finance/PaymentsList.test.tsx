import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaymentsList } from '@/features/finance/components/PaymentsList';
import { supabase } from '@/lib/supabase';
import type { Payment } from '@/features/finance/types';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

const mockPayments: Payment[] = [
  {
    id: 'pay-1',
    workspace_id: 'ws-123',
    project_id: 'proj-456',
    type: 'dp',
    label: '50% Initial Booking DP',
    amount: 5000000,
    due_date: '2026-08-01',
    status: 'paid',
    paid_date: '2026-08-01',
    payment_method: 'Bank Transfer (BCA)',
    notes: 'DP confirmed received',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
  },
  {
    id: 'pay-2',
    workspace_id: 'ws-123',
    project_id: 'proj-456',
    type: 'final',
    label: 'Final Settlement',
    amount: 5000000,
    due_date: '2026-10-15',
    status: 'pending',
    paid_date: null,
    payment_method: null,
    notes: null,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
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

describe('PaymentsList (FIN-REQ-001 / FIN-REQ-002)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  function renderList(isForceClosed = false) {
    return render(
      <QueryClientProvider client={queryClient}>
        <PaymentsList
          workspaceId="ws-123"
          projectId="proj-456"
          currency="IDR"
          isForceClosed={isForceClosed}
        />
      </QueryClientProvider>
    );
  }

  it('renders payment milestones with amounts, labels, and status badges', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockPayments) as never);

    renderList();

    expect(await screen.findByText('50% Initial Booking DP')).toBeInTheDocument();
    expect(screen.getByText('Final Settlement')).toBeInTheDocument();
    expect(screen.getByTestId('payment-status-paid')).toBeInTheDocument();
    expect(screen.getByTestId('payment-status-upcoming')).toBeInTheDocument();
  });

  it('toggles payment status from pending to paid', async () => {
    const mockBuilder = createMockQueryBuilder(mockPayments);
    vi.mocked(supabase.from).mockReturnValue(mockBuilder as never);

    renderList();

    const markPaidBtn = await screen.findByTestId('toggle-paid-pay-2-btn');
    fireEvent.click(markPaidBtn);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('payments');
      expect(mockBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'paid',
        })
      );
    });
  });

  it('permits marking payments paid even on force_closed projects while hiding add/delete', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockPayments) as never);

    renderList(true); // isForceClosed = true

    expect(await screen.findByText('50% Initial Booking DP')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-paid-pay-2-btn')).toBeInTheDocument();
    expect(screen.queryByTestId('add-payment-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-payment-pay-1-btn')).not.toBeInTheDocument();
  });
});
