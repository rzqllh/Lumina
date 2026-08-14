import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { CollaboratorsRoute } from '@/routes/settings/CollaboratorsRoute';
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

const mockCollaborators = [
  {
    id: 'collab-1',
    workspace_id: 'ws-123',
    name: 'Budi Santoso',
    phone: '+6281234567890',
    email: 'budi@cinecrew.id',
    specialty: 'Drone Operator',
    notes: 'DJI Mavic 3 Pro owner, certified pilot',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'collab-2',
    workspace_id: 'ws-123',
    name: 'Siti Rahma',
    phone: '+6281987654321',
    email: 'siti@editlab.com',
    specialty: 'Colorist / Lead Editor',
    notes: 'DaVinci Resolve Studio',
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
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

describe('CollaboratorsRoute & CollaboratorsList (STAB-P1-001)', () => {
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

  function renderCollaboratorsPage() {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/settings/collaborators']}>
          <CollaboratorsRoute />
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  it('renders list of collaborators with specialties, contacts, and search filtering', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockCollaborators) as never);

    renderCollaboratorsPage();

    expect(await screen.findByText('Crew & Collaborators')).toBeInTheDocument();
    expect(await screen.findByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText('Drone Operator')).toBeInTheDocument();
    expect(screen.getByText('+6281234567890')).toBeInTheDocument();
    expect(screen.getByText('Siti Rahma')).toBeInTheDocument();
    expect(screen.getByText('Colorist / Lead Editor')).toBeInTheDocument();

    // Test Search filter
    const searchInput = screen.getByTestId('collaborator-search-input');
    fireEvent.change(searchInput, { target: { value: 'Drone' } });

    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.queryByText('Siti Rahma')).not.toBeInTheDocument();
  });

  it('renders empty state when no collaborators exist and allows opening create modal', async () => {
    vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder([]) as never);

    renderCollaboratorsPage();

    expect(await screen.findByTestId('collaborators-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No collaborators added yet')).toBeInTheDocument();

    // Click CTA to open modal
    const addBtn = screen.getByTestId('empty-add-collaborator-btn');
    fireEvent.click(addBtn);

    expect(screen.getByTestId('collaborator-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('collaborator-specialty-input')).toBeInTheDocument();
  });

  it('creates a new collaborator successfully', async () => {
    const newCollab = {
      id: 'collab-3',
      workspace_id: 'ws-123',
      name: 'Rian Pratama',
      specialty: 'Sound Engineer',
      phone: '+628111222333',
      email: 'rian@sound.id',
      notes: null,
      created_at: '2026-01-03T00:00:00Z',
      updated_at: '2026-01-03T00:00:00Z',
    };

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'collaborators') {
        return createMockQueryBuilder([newCollab]) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderCollaboratorsPage();

    const addBtn = await screen.findByTestId('add-collaborator-btn');
    fireEvent.click(addBtn);

    const nameInput = screen.getByTestId('collaborator-name-input');
    const specialtyInput = screen.getByTestId('collaborator-specialty-input');
    const phoneInput = screen.getByTestId('collaborator-phone-input');
    const emailInput = screen.getByTestId('collaborator-email-input');

    fireEvent.change(nameInput, { target: { value: 'Rian Pratama' } });
    fireEvent.change(specialtyInput, { target: { value: 'Sound Engineer' } });
    fireEvent.change(phoneInput, { target: { value: '+628111222333' } });
    fireEvent.change(emailInput, { target: { value: 'rian@sound.id' } });

    const submitBtn = screen.getByTestId('submit-collaborator-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('collaborators');
    });
  });

  it('prevents deletion of a collaborator who is referenced in project engagements', async () => {
    window.confirm = vi.fn().mockReturnValue(true);

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'collaborators') {
        return createMockQueryBuilder(mockCollaborators) as never;
      }
      if (table === 'collaborator_engagements') {
        // Return existing engagement referencing this collaborator
        return createMockQueryBuilder([{ id: 'eng-1', collaborator_id: 'collab-1' }]) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderCollaboratorsPage();

    const deleteBtn = await screen.findByTestId('delete-collaborator-btn-collab-1');
    fireEvent.click(deleteBtn);

    // Shows graceful error alert preserving historical records
    expect(
      await screen.findByText(
        /Cannot delete crew member assigned to existing or historical projects/i
      )
    ).toBeInTheDocument();
  });

  it('allows deletion of an unreferenced collaborator with confirmation', async () => {
    window.confirm = vi.fn().mockReturnValue(true);

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'collaborators') {
        return createMockQueryBuilder(mockCollaborators) as never;
      }
      if (table === 'collaborator_engagements') {
        // No engagements found
        return createMockQueryBuilder([]) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderCollaboratorsPage();

    const deleteBtn = await screen.findByTestId('delete-collaborator-btn-collab-1');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('collaborator_engagements');
      expect(supabase.from).toHaveBeenCalledWith('collaborators');
    });
  });
});
