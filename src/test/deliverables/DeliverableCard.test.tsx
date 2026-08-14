import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeliverableCard } from '@/features/deliverables/components/DeliverableCard';
import type { Deliverable } from '@/features/deliverables/types';

const mockDeliverable: Deliverable = {
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
      due_date: null,
      feedback: 'Adjust color temperature',
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

describe('DeliverableCard (DELIV-REQ-001 / DELIV-REQ-003)', () => {
  it('renders deliverable details, status badge, and revision history', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onStatusChange = vi.fn();
    const onRequestRevision = vi.fn();
    const onUpdateRevisionStatus = vi.fn();

    render(
      <DeliverableCard
        deliverable={mockDeliverable}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onRequestRevision={onRequestRevision}
        onUpdateRevisionStatus={onUpdateRevisionStatus}
      />
    );

    expect(screen.getByText('50 Edited High-Res Photos')).toBeInTheDocument();
    expect(screen.getByTestId('deliverable-status-delivered')).toBeInTheDocument();
    expect(screen.getByTestId('revision-status-delivered')).toBeInTheDocument();
    expect(screen.getByText('Qty: 50')).toBeInTheDocument();
    expect(screen.getByText('Photos')).toBeInTheDocument();
    expect(screen.getByText('Round #1')).toBeInTheDocument();
    expect(screen.getByText('Adjust color temperature')).toBeInTheDocument();
  });

  it('triggers quick actions for request revision and edit', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onStatusChange = vi.fn();
    const onRequestRevision = vi.fn();
    const onUpdateRevisionStatus = vi.fn();

    render(
      <DeliverableCard
        deliverable={mockDeliverable}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onRequestRevision={onRequestRevision}
        onUpdateRevisionStatus={onUpdateRevisionStatus}
      />
    );

    const revBtn = screen.getByTestId('request-rev-deliv-1-btn');
    fireEvent.click(revBtn);
    expect(onRequestRevision).toHaveBeenCalledWith(mockDeliverable);

    const editBtn = screen.getByTestId('edit-deliv-deliv-1-btn');
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(mockDeliverable);
  });
});
