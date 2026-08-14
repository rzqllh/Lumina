import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RevisionModal } from '@/features/deliverables/components/RevisionModal';
import type { Deliverable } from '@/features/deliverables/types';

const mockDeliverable: Deliverable = {
  id: 'deliv-1',
  workspace_id: 'ws-123',
  project_id: 'proj-456',
  label: '4K Cinematic Teaser',
  quantity: 1,
  type_label: 'Video',
  deadline: '2026-10-01',
  status: 'delivered',
  notes: null,
  revisions: [
    {
      id: 'rev-1',
      workspace_id: 'ws-123',
      deliverable_id: 'deliv-1',
      revision_number: 1,
      requested_date: '2026-09-25',
      due_date: null,
      feedback: 'First round feedback',
      status: 'delivered',
      delivered_date: '2026-09-27',
      notes: null,
      created_at: '2026-09-25T10:00:00Z',
      updated_at: '2026-09-27T14:00:00Z',
    },
  ],
  created_at: '2026-08-14T01:00:00Z',
  updated_at: '2026-08-14T01:00:00Z',
};

describe('RevisionModal (DELIV-REQ-003)', () => {
  it('renders modal with next revision number and submits valid feedback', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <RevisionModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        deliverable={mockDeliverable}
      />
    );

    // Header displays Revision #2 (since Revision #1 exists)
    expect(screen.getByRole('heading', { name: 'Log Revision #2' })).toBeInTheDocument();
    expect(screen.getByText('4K Cinematic Teaser')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Client Feedback \/ Change Requests/i), {
      target: { value: 'Please brighten scene at 0:45 and add fade-to-black' },
    });
    fireEvent.change(screen.getByLabelText(/Revised Due Date/i), {
      target: { value: '2026-10-05' },
    });

    const submitBtn = screen.getByTestId('revision-submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          feedback: 'Please brighten scene at 0:45 and add fade-to-black',
          due_date: '2026-10-05',
        })
      );
    });
  });

  it('validates minimum length for feedback', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(
      <RevisionModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        deliverable={mockDeliverable}
      />
    );

    fireEvent.change(screen.getByLabelText(/Client Feedback \/ Change Requests/i), {
      target: { value: 'Bad' },
    });

    const submitBtn = screen.getByTestId('revision-submit-btn');
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText('Client feedback must be at least 5 characters')
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
