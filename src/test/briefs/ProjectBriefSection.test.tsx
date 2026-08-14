import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectBriefSection } from '@/features/briefs/components/ProjectBriefSection';
import { supabase } from '@/lib/supabase';
import type { Brief } from '@/features/briefs/types';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

const mockBrief: Brief = {
  id: 'brief-123',
  workspace_id: 'ws-123',
  project_id: 'proj-123',
  source_template_id: null,
  title: 'Editorial Shoot Brief',
  created_at: '2026-08-14T10:00:00Z',
  updated_at: '2026-08-14T10:00:00Z',
  sections: [
    {
      id: 'sec-1',
      brief_id: 'brief-123',
      label: 'Creative Moodboard & Aesthetics',
      instruction_text: 'Please provide visual links and references',
      position: 0,
      created_at: '2026-08-14T10:00:00Z',
      fields: [
        {
          id: 'field-1',
          section_id: 'sec-1',
          field_type: 'url',
          label: 'Pinterest Moodboard URL',
          helper_text: 'Paste board link',
          is_required: true,
          visibility: 'client_must_fill',
          value: 'https://pinterest.com/editorial-vibe',
          position: 0,
          created_at: '2026-08-14T10:00:00Z',
          updated_at: '2026-08-14T10:00:00Z',
        },
      ],
    },
  ],
};

function createMockQueryBuilder(data: unknown = null, error: unknown = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnValue(Promise.resolve({ data, error })),
    maybeSingle: vi.fn().mockReturnValue(Promise.resolve({ data, error })),
    then: (resolve: (val: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve({ data, error }).then(resolve),
  };
  return builder;
}

describe('ProjectBriefSection (BRIEF-REQ-001 / BRIEF-REQ-003 / BRIEF-REQ-005)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  function renderSection() {
    return render(
      <QueryClientProvider client={queryClient}>
        <ProjectBriefSection workspaceId="ws-123" projectId="proj-123" />
      </QueryClientProvider>
    );
  }

  it('renders project brief sections and question fields with visibility badges', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'briefs') {
        return createMockQueryBuilder(mockBrief) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderSection();

    expect(await screen.findByText('Project Creative Brief & Client Intake')).toBeInTheDocument();
    expect(screen.getByText('Creative Moodboard & Aesthetics')).toBeInTheDocument();
    expect(screen.getByText('Pinterest Moodboard URL')).toBeInTheDocument();
    expect(screen.getByText('Client Must Fill *')).toBeInTheDocument();
    expect(screen.getByText('https://pinterest.com/editorial-vibe')).toBeInTheDocument();
  });

  it('opens section creation modal and creates a new section', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'briefs') {
        return createMockQueryBuilder(mockBrief) as never;
      }
      if (table === 'brief_sections') {
        return createMockQueryBuilder({
          id: 'sec-2',
          brief_id: 'brief-123',
          label: 'Logistics & Call Times',
          instruction_text: 'Location access details',
          position: 1,
        }) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderSection();

    const addSectionBtn = await screen.findByTestId('add-brief-section-btn');
    fireEvent.click(addSectionBtn);

    expect(screen.getByTestId('brief-section-form-modal')).toBeInTheDocument();

    const labelInput = screen.getByTestId('section-label-input');
    fireEvent.change(labelInput, { target: { value: 'Logistics & Call Times' } });

    const submitBtn = screen.getByTestId('section-submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('brief_sections');
    });
  });

  it('displays pending submissions badge when client submissions exist', async () => {
    const mockSubmission = {
      id: 'sub-1',
      brief_id: 'brief-123',
      submitted_values: { 'field-1': 'https://pinterest.com/new-vibe' },
      submitted_at: '2026-08-14T11:00:00Z',
      review_status: 'pending',
      reviewed_at: null,
    };

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'briefs') {
        return createMockQueryBuilder(mockBrief) as never;
      }
      if (table === 'brief_submissions') {
        return createMockQueryBuilder([mockSubmission]) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderSection();

    expect(await screen.findByTestId('pending-submissions-badge')).toBeInTheDocument();
    expect(screen.getByText('1 new client submission')).toBeInTheDocument();
  });
});
