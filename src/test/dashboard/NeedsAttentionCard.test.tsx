import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { NeedsAttentionCard } from '@/features/dashboard/components/NeedsAttentionCard';
import type { AttentionItem } from '@/features/dashboard/types';

describe('NeedsAttentionCard (DASH-REQ-001)', () => {
  it('renders all caught up state when items are empty', () => {
    render(
      <MemoryRouter>
        <NeedsAttentionCard items={[]} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('attention-empty-state')).toBeInTheDocument();
    expect(screen.getByText('All caught up!')).toBeInTheDocument();
  });

  it('renders attention items with overdue invoices and deliverable warnings', () => {
    const mockItems: AttentionItem[] = [
      {
        id: 'pay-1',
        type: 'overdue_payment',
        title: 'Final Settlement',
        subtitle: 'Overdue since 2026-08-01',
        dueDate: '2026-08-01',
        projectId: 'proj-1',
        projectTitle: 'Bali Wedding 2026',
        amount: 5000000,
        severity: 'high',
      },
      {
        id: 'rev-1',
        type: 'revision_requested',
        title: 'Highlight Reel Teaser',
        subtitle: 'Client requested revisions',
        dueDate: '2026-08-14',
        projectId: 'proj-1',
        projectTitle: 'Bali Wedding 2026',
        severity: 'high',
      },
    ];

    render(
      <MemoryRouter>
        <NeedsAttentionCard items={mockItems} currency="IDR" />
      </MemoryRouter>
    );

    expect(screen.getByTestId('attention-badge-count')).toHaveTextContent('2');
    expect(screen.getByText('Final Settlement')).toBeInTheDocument();
    expect(screen.getByText('Highlight Reel Teaser')).toBeInTheDocument();
    expect(screen.getByText('Overdue since 2026-08-01')).toBeInTheDocument();
  });
});
