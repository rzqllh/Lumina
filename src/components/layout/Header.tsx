import React from 'react';
import { NavLink } from 'react-router';
import { Sparkles, Calendar, FolderKanban, Users, Settings, LogOut } from 'lucide-react';
import { useAuth, useWorkspace } from '@/lib/auth';

export const Header: React.FC = () => {
  const { signOut, user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const navLinks = [
    { to: '/', label: 'Overview', icon: Sparkles },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/calendar', label: 'Schedule', icon: Calendar },
    { to: '/clients', label: 'Clients', icon: Users },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary font-bold text-xs text-primary-foreground shadow-xs">
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

        {/* Desktop Navigation Links & Sign Out */}
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-surface-muted text-text-primary'
                        : 'text-text-secondary hover:bg-surface-muted/60 hover:text-text-primary'
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            data-testid="header-signout-button"
            onClick={() => signOut()}
            aria-label="Sign out"
            title="Sign out of Lumina"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-muted hover:text-status-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
