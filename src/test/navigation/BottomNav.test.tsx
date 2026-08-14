import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { BottomNav } from '@/components/layout/BottomNav';

describe('BottomNav Accessibility & Shell Quality', () => {
  it('renders a semantic navigation landmark with aria-label', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <BottomNav />
      </MemoryRouter>
    );

    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('renders all 5 core navigation destinations with correct hrefs', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <BottomNav />
      </MemoryRouter>
    );

    const overviewLink = screen.getByRole('link', { name: /overview/i });
    const projectsLink = screen.getByRole('link', { name: /projects/i });
    const scheduleLink = screen.getByRole('link', { name: /schedule/i });
    const clientsLink = screen.getByRole('link', { name: /clients/i });
    const settingsLink = screen.getByRole('link', { name: /settings/i });

    expect(overviewLink).toHaveAttribute('href', '/');
    expect(projectsLink).toHaveAttribute('href', '/projects');
    expect(scheduleLink).toHaveAttribute('href', '/calendar');
    expect(clientsLink).toHaveAttribute('href', '/clients');
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('sets aria-current="page" only on the active route', () => {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <BottomNav />
      </MemoryRouter>
    );

    const projectsLink = screen.getByRole('link', { name: /projects/i });
    const overviewLink = screen.getByRole('link', { name: /overview/i });
    const scheduleLink = screen.getByRole('link', { name: /schedule/i });

    expect(projectsLink).toHaveAttribute('aria-current', 'page');
    expect(overviewLink).not.toHaveAttribute('aria-current');
    expect(scheduleLink).not.toHaveAttribute('aria-current');
  });

  it('matches subroutes for projects and calendar correctly', () => {
    render(
      <MemoryRouter initialEntries={['/projects/proj-123/edit']}>
        <BottomNav />
      </MemoryRouter>
    );

    const projectsLink = screen.getByRole('link', { name: /projects/i });
    expect(projectsLink).toHaveAttribute('aria-current', 'page');
  });
});
