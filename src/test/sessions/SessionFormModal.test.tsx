import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionFormModal } from '@/features/sessions/components/SessionFormModal';
import type { Session } from '@/features/sessions/types';

describe('SessionFormModal (SESS-REQ-002 / SESS-REQ-003)', () => {
  it('renders creation form fields and submits valid payload', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(<SessionFormModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);

    expect(screen.getByRole('heading', { name: /Schedule New Session/i })).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Session Title/i);
    fireEvent.change(titleInput, { target: { value: 'Main Wedding Ceremony' } });

    const dateInput = screen.getByLabelText(/Date/i);
    fireEvent.change(dateInput, { target: { value: '2026-09-15' } });

    const locationInput = screen.getByLabelText(/Location \/ Venue/i);
    fireEvent.change(locationInput, { target: { value: 'St. Mary Cathedral' } });

    const submitBtn = screen.getByTestId('session-submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Main Wedding Ceremony',
          location: 'St. Mary Cathedral',
          type: 'shoot',
          status: 'scheduled',
        })
      );
    });
  });

  it('shows custom label field when custom type is selected and enforces validation', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(<SessionFormModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);

    const customTypeRadio = screen.getByLabelText('Custom');
    fireEvent.click(customTypeRadio);

    expect(screen.getByLabelText(/Custom Label/i)).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Session Title/i);
    fireEvent.change(titleInput, { target: { value: 'Studio Fitting' } });

    // Submit without custom label
    const submitBtn = screen.getByTestId('session-submit-btn');
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Please provide a custom label for custom session type/i)
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('populates initialData when editing an existing session', async () => {
    const mockInitial: Session = {
      id: 'sess-edit',
      workspace_id: 'ws-1',
      project_id: 'proj-1',
      type: 'event_day',
      custom_type_label: null,
      title: 'Reception Evening Party',
      date: '2026-10-10',
      start_time: '18:00:00',
      end_time: '22:00:00',
      location: 'Grand Ballroom Hyatt',
      notes: 'Photo booth setup in lobby',
      status: 'scheduled',
      google_calendar_event_id: null,
      created_at: '2026-08-14T00:00:00Z',
      updated_at: '2026-08-14T00:00:00Z',
    };

    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <SessionFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={mockInitial}
      />
    );

    expect(screen.getByRole('heading', { name: /Edit Session/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Reception Evening Party')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Grand Ballroom Hyatt')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-10-10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Photo booth setup in lobby')).toBeInTheDocument();
  });
});
