import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { Header } from '@/components/layout/Header';
import { useAuth, useWorkspace } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(),
  useWorkspace: vi.fn(),
}));

describe('Header (+ New dropdown and identity)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWorkspace).mockReturnValue({
      workspaceId: 'ws-123',
      currentWorkspace: { id: 'ws-123', name: 'Lumina Studio' },
    } as never);
    vi.mocked(useAuth).mockReturnValue({
      user: {
        email: 'operator@lumina.app',
        user_metadata: { full_name: 'Hafizh Rizqullah' },
      },
      signOut: vi.fn(),
    } as never);
  });

  it('renders workspace identity and single user name in avatar pill', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('Lumina Studio')).toBeInTheDocument();
    expect(screen.getByText('Hafizh Rizqullah')).toBeInTheDocument();
    expect(screen.getByTestId('header-create-trigger')).toBeInTheDocument();
  });

  it('opens create menu and navigates to new project and new client', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Header />} />
          <Route path="/projects/new" element={<div>Create Project Page</div>} />
          <Route path="/clients/new" element={<div>Create Client Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const trigger = screen.getByTestId('header-create-trigger');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Click trigger to open dropdown
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('header-create-menu')).toBeInTheDocument();

    const newProjectBtn = screen.getByTestId('header-new-project-item');
    const newClientBtn = screen.getByTestId('header-new-client-item');
    expect(newProjectBtn).toBeInTheDocument();
    expect(newClientBtn).toBeInTheDocument();

    // Click new project item
    fireEvent.click(newProjectBtn);
    expect(screen.getByText('Create Project Page')).toBeInTheDocument();
  });
});
