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
          <nav aria-label="Desktop Navigation" className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? 'bg-surface-muted text-text-primary font-semibold'
                        : 'text-text-secondary hover:bg-surface-muted/70 hover:text-text-primary'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            data-testid="header-signout-button"
            onClick={() => signOut()}
            aria-label="Sign out of Lumina"
            title="Sign out of Lumina"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-muted hover:text-status-danger hover:border-status-danger/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
