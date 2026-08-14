import React from 'react';
import { NavLink } from 'react-router';
import { Sparkles, Calendar, FolderKanban, Users, Settings, LogOut } from 'lucide-react';
import { useAuth, useWorkspace } from '@/lib/auth';

const navLinks = [
  { to: '/', label: 'Overview', icon: Sparkles, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban, end: false },
  { to: '/calendar', label: 'Schedule', icon: Calendar, end: false },
  { to: '/clients', label: 'Clients', icon: Users, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const;

export const Header: React.FC = () => {
  const { signOut, user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            L
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-text-primary">
              {currentWorkspace?.name || 'Lumina'}
            </span>
            <span className="text-[10px] text-text-muted hidden sm:inline">
              {user?.email || 'Personal Workspace'}
            </span>
          </div>
        </div>

        {/* Desktop Navigation & Sign Out */}
        <div className="flex items-center gap-1">
          <nav aria-label="Desktop navigation" className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-[var(--transition-normal)]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      isActive
                        ? 'bg-surface-muted text-text-primary font-semibold'
                        : 'text-text-secondary hover:bg-surface-muted/60 hover:text-text-primary',
                    ].join(' ')
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Sign Out — ghost button, no competing border/shadow */}
          <button
            type="button"
            data-testid="header-signout-button"
            onClick={() => signOut()}
            aria-label="Sign out of Lumina"
            title="Sign out"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition-colors duration-[var(--transition-normal)] hover:bg-surface-muted hover:text-status-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
