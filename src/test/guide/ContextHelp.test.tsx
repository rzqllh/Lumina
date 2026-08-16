import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ContextHelp } from '@/components/ui/context-help';

describe('ContextHelp Component', () => {
  it('renders trigger button with accessible label', () => {
    render(
      <MemoryRouter>
        <ContextHelp
          title="Project Closure"
          description="Requires all deliverables approved and full payment received."
          guideAnchor="#project-closure"
        />
      </MemoryRouter>
    );

    const trigger = screen.getByRole('button', { name: /Help: Project Closure/i });
    expect(trigger).toBeInTheDocument();
  });

  it('opens popover dialog on click and displays content and guide deep-link', () => {
    render(
      <MemoryRouter>
        <ContextHelp
          title="Project Closure"
          description="Requires all deliverables approved and full payment received."
          guideAnchor="#project-closure"
        />
      </MemoryRouter>
    );

    const trigger = screen.getByRole('button', { name: /Help: Project Closure/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Project Closure')).toBeInTheDocument();
    expect(
      screen.getByText('Requires all deliverables approved and full payment received.')
    ).toBeInTheDocument();

    const guideLink = screen.getByRole('link', { name: /Read full guide/i });
    expect(guideLink).toHaveAttribute('href', '/settings/guide#project-closure');
  });

  it('closes dialog on Escape key press', () => {
    render(
      <MemoryRouter>
        <ContextHelp
          title="Receivable"
          description="Receivable is Project Value minus Paid Amount."
          guideAnchor="#payments-finance"
        />
      </MemoryRouter>
    );

    const trigger = screen.getByRole('button', { name: /Help: Receivable/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes dialog when close button is clicked', () => {
    render(
      <MemoryRouter>
        <ContextHelp
          title="Receivable"
          description="Receivable is Project Value minus Paid Amount."
        />
      </MemoryRouter>
    );

    const trigger = screen.getByRole('button', { name: /Help: Receivable/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close help/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
