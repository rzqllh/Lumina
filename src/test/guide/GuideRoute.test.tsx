import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { GuideRoute } from '@/routes/settings/GuideRoute';
import { guideCategories } from '@/features/guide/data/guideContent';

describe('GuideRoute (/settings/guide)', () => {
  function renderGuide(initialEntry = '/settings/guide') {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <GuideRoute />
      </MemoryRouter>
    );
  }

  it('renders page header and core mental model flow banner', () => {
    renderGuide();

    expect(screen.getByRole('heading', { level: 1, name: 'Lumina Guide' })).toBeInTheDocument();
    expect(
      screen.getByText('How the current project workflow and tools work.')
    ).toBeInTheDocument();
    expect(screen.getByTestId('guide-mental-model-banner')).toBeInTheDocument();
    expect(screen.getByText(/1\. Client/i)).toBeInTheDocument();
    expect(screen.getByText(/6\. Close Project/i)).toBeInTheDocument();
  });

  it('renders all 13 required top-level categories', () => {
    renderGuide();

    expect(guideCategories).toHaveLength(13);

    for (const category of guideCategories) {
      expect(screen.getByTestId(`guide-section-${category.id}`)).toBeInTheDocument();
    }
  });

  it('verifies all 10 contextual help anchor IDs exist in the DOM', () => {
    const { container } = renderGuide();

    const requiredAnchors = [
      'project-closure',
      'payments-finance',
      'deliverables-revisions',
      'project-brief',
      'files-sharing',
      'collaborators-costs',
      'services-packages',
      'workflow-tasks',
      'getting-started',
      'clients-contacts',
      'projects',
      'sessions-schedule',
      'dashboard-overview',
    ];

    for (const anchor of requiredAnchors) {
      const el = container.querySelector(`#${anchor}`);
      expect(el).not.toBeNull();
    }
  });

  it('contains canonical finance terminology', () => {
    renderGuide();

    const financeSection = screen.getByTestId('guide-section-payments-finance');
    expect(financeSection).toHaveTextContent(/Project Value/i);
    expect(financeSection).toHaveTextContent(/Paid Amount/i);
    expect(financeSection).toHaveTextContent(/Receivable/i);
    expect(financeSection).toHaveTextContent(/Projected Profit/i);
    expect(financeSection).toHaveTextContent(/Generic Expenses/i);
    expect(financeSection).toHaveTextContent(/Committed Collaborator Cost/i);
    expect(financeSection).toHaveTextContent(/Total Project Cost/i);
    expect(financeSection).toHaveTextContent(/Margin/i);
  });

  it('does NOT contain forbidden non-canonical terms', () => {
    renderGuide();

    const text = document.body.textContent || '';
    expect(text).not.toContain('Unpaid Invoice');
    expect(text).not.toContain('Net Profit');
    expect(text).not.toContain('Balance Due');
    expect(text).not.toContain('Media Downloads');
    expect(text).not.toContain('Call Sheet');
  });

  it('explains Normal Close, Force Close, and Reopening accurately', () => {
    renderGuide();

    const closureSection = screen.getByTestId('guide-section-project-closure');
    expect(closureSection).toHaveTextContent(/Normal Close/i);
    expect(closureSection).toHaveTextContent(/Receivable is zero/i);
    expect(closureSection).toHaveTextContent(/Force Close/i);
    expect(closureSection).toHaveTextContent(/written audit reason/i);
    expect(closureSection).toHaveTextContent(/Operational editing/i);
    expect(closureSection).toHaveTextContent(/frozen/i);
    expect(closureSection).toHaveTextContent(/Reopening/i);
  });
});
