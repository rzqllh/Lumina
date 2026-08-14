import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeliverableFormModal } from '@/features/deliverables/components/DeliverableFormModal';

describe('DeliverableFormModal (DELIV-REQ-002)', () => {
  it('renders creation form fields and submits valid payload', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <DeliverableFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={null}
      />
    );

    expect(screen.getByText('Add Promised Deliverable')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Deliverable Title/i), {
      target: { value: 'Social Media 15s Cut' },
    });
    fireEvent.change(screen.getByLabelText(/Quantity/i), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByLabelText(/Category \/ Format/i), {
      target: { value: 'Reels' },
    });
    fireEvent.change(screen.getByLabelText(/Target Delivery Deadline/i), {
      target: { value: '2026-11-01' },
    });

    const submitBtn = screen.getByTestId('deliverable-submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Social Media 15s Cut',
          quantity: 5,
          type_label: 'Reels',
          deadline: '2026-11-01',
          status: 'planned',
        })
      );
    });
  });

  it('shows validation error when title is too short', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(
      <DeliverableFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={null}
      />
    );

    fireEvent.change(screen.getByLabelText(/Deliverable Title/i), {
      target: { value: 'A' },
    });

    const submitBtn = screen.getByTestId('deliverable-submit-btn');
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText('Deliverable title must be at least 2 characters')
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
