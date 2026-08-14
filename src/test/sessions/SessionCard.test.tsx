import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionCard } from '@/features/sessions/components/SessionCard';
import type { Session } from '@/features/sessions/types';

const mockSession: Session = {
  id: 'sess-card-1',
  workspace_id: 'ws-1',
  project_id: 'proj-1',
  type: 'pre_production',
  custom_type_label: null,
  title: 'Location Scouting',
  date: '2026-09-05',
  start_time: '09:00:00',
  end_time: '11:00:00',
  location: 'Tea Garden Puncak',
  notes: 'Check drone flight permissions',
  status: 'scheduled',
  google_calendar_event_id: null,
  created_at: '2026-08-14T00:00:00Z',
  updated_at: '2026-08-14T00:00:00Z',
};

describe('SessionCard (SESS-REQ-001 / SESS-REQ-007)', () => {
  it('renders session card with formatted date, times, location and badges', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onStatusChange = vi.fn();

    render(
      <SessionCard
        session={mockSession}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
    );

    expect(screen.getByText('Location Scouting')).toBeInTheDocument();
    expect(screen.getByText('Pre-Production')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Tea Garden Puncak')).toBeInTheDocument();
    expect(screen.getByText('09:00 – 11:00')).toBeInTheDocument();
    expect(screen.getByText('Check drone flight permissions')).toBeInTheDocument();
  });

  it('triggers edit and delete callbacks', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onStatusChange = vi.fn();

    render(
      <SessionCard
        session={mockSession}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
    );

    const editBtn = screen.getByTestId('session-edit-btn-sess-card-1');
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(mockSession);

    const deleteBtn = screen.getByTestId('session-delete-btn-sess-card-1');
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith('sess-card-1');
  });
});
