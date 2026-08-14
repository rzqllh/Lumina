import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CollaboratorEngagementModal } from '@/features/finance';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockCollaborators = [
  {
    id: 'collab-1',
    workspace_id: 'ws-123',
    name: 'Budi Santoso',
    phone: '+6281234567890',
    email: 'budi@cinecrew.id',
    specialty: 'Drone Operator',
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

function createMockQueryBuilder(data: unknown = null, error: unknown = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() =>
      Promise.resolve({
        data: Array.isArray(data) ? data[0] : data,
        error,
      })
    ),
    then: (resolve: (val: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve({ data, error }).then(resolve),
  };
  return builder;
}

describe('CollaboratorEngagementModal — Inline Collaborator Creation (STAB-P1-001)', () => {
  let queryClient: QueryClient;
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  function renderModal() {
    return render(
      <QueryClientProvider client={queryClient}>
        <CollaboratorEngagementModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          workspaceId="ws-123"
        />
      </QueryClientProvider>
    );
  }

  it('renders modal with existing collaborators and shows inline "+ New Crew Member" button', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockCollaborators) as never);

    renderModal();

    expect(await screen.findByText(/Engage External Crew/i)).toBeInTheDocument();
    expect(screen.getByTestId('inline-add-collaborator-btn')).toBeInTheDocument();
    expect(screen.getByText(/Budi Santoso \(Drone Operator\)/i)).toBeInTheDocument();
  });

  it('opens inline create modal and creates a new collaborator on the fly', async () => {
    const createdCollab = {
      id: 'collab-new',
      workspace_id: 'ws-123',
      name: 'Dewi Video',
      specialty: 'Second Camera',
      phone: null,
      email: null,
      notes: null,
      created_at: '2026-01-02T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    };

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'collaborators') {
        return createMockQueryBuilder([createdCollab]) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderModal();

    const inlineAddBtn = await screen.findByTestId('inline-add-collaborator-btn');
    fireEvent.click(inlineAddBtn);

    // Modal opens
    expect(screen.getByTestId('collaborator-name-input')).toBeInTheDocument();
    const nameInput = screen.getByTestId('collaborator-name-input');
    const specialtyInput = screen.getByTestId('collaborator-specialty-input');

    fireEvent.change(nameInput, { target: { value: 'Dewi Video' } });
    fireEvent.change(specialtyInput, { target: { value: 'Second Camera' } });

    const submitBtn = screen.getByTestId('submit-collaborator-btn');
    fireEvent.submit(submitBtn.closest('form')!);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('collaborators');
    });
  });
});
