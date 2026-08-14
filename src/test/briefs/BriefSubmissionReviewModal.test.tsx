import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BriefSubmissionReviewModal } from '@/features/briefs/components/BriefSubmissionReviewModal';
import { supabase } from '@/lib/supabase';
import type { Brief, BriefSubmission } from '@/features/briefs/types';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const mockBrief: Brief = {
  id: 'brief-123',
  workspace_id: 'ws-123',
  project_id: 'proj-123',
  source_template_id: null,
  title: 'Fashion Editorial',
  created_at: '2026-08-14T10:00:00Z',
  updated_at: '2026-08-14T10:00:00Z',
  sections: [
    {
      id: 'sec-1',
      brief_id: 'brief-123',
      label: 'Creative Vibe',
      instruction_text: null,
      position: 0,
      created_at: '2026-08-14T10:00:00Z',
      fields: [
        {
          id: 'field-101',
          section_id: 'sec-1',
          field_type: 'short_text',
          label: 'Brand Look & Feel',
          helper_text: null,
          is_required: true,
          visibility: 'client_must_fill',
          value: 'Minimalist Tokyo Streetwear',
          position: 0,
          created_at: '2026-08-14T10:00:00Z',
          updated_at: '2026-08-14T10:00:00Z',
        },
      ],
    },
  ],
};

const mockSubmissions: BriefSubmission[] = [
  {
    id: 'sub-999',
    brief_id: 'brief-123',
    submitted_values: {
      'field-101': 'Cyberpunk Neon Noir Aesthetics',
    },
    submitted_at: '2026-08-14T14:00:00Z',
    review_status: 'pending',
    reviewed_at: null,
  },
];

describe('BriefSubmissionReviewModal (BRIEF-REQ-005 / INV-003 / INV-012)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it('compares submitted answer with canonical field and applies accepted review decision', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: { success: true, fields_applied: 1 },
      error: null,
    } as never);

    const handleClose = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <BriefSubmissionReviewModal
          isOpen={true}
          onClose={handleClose}
          workspaceId="ws-123"
          projectId="proj-123"
          brief={mockBrief}
          submissions={mockSubmissions}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText('Client Brief Submissions Review')).toBeInTheDocument();
    expect(screen.getByText('Brand Look & Feel')).toBeInTheDocument();
    expect(screen.getByText('Minimalist Tokyo Streetwear')).toBeInTheDocument();
    expect(screen.getByText('Cyberpunk Neon Noir Aesthetics')).toBeInTheDocument();

    const applyBtn = screen.getByTestId('apply-submission-review-btn');
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('apply_brief_submission_review', {
        p_submission_id: 'sub-999',
        p_accepted_fields: [
          {
            field_id: 'field-101',
            value: 'Cyberpunk Neon Noir Aesthetics',
          },
        ],
      });
    });

    expect(handleClose).toHaveBeenCalled();
  });
});
