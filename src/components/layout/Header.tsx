import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { Sparkles, Calendar, FolderKanban, Users, Settings, LogOut, Plus } from 'lucide-react';
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
  const navigate = useNavigate();

  const userInitial = (user?.user_metadata?.full_name || user?.email || 'U')
    .charAt(0)
    .toUpperCase();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Studio Owner';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-surface/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Workspace Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-accent text-xs font-bold text-primary-foreground shadow-xs border border-primary/20">
            <span>L</span>
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-status-success ring-2 ring-surface" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-text-primary leading-tight">
              {currentWorkspace?.name || 'Lumina Studio'}
            </span>
            <span className="text-[11px] text-text-muted hidden sm:inline leading-tight">
              Creative Operating System
            </span>
          </div>
        </div>

        {/* Primary Navigation — Refined Segmented Pill on Desktop */}
        <nav
          aria-label="Desktop navigation"
          className="hidden md:flex items-center gap-1 rounded-full bg-surface-muted/50 p-1 border border-border/60"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] transition-all duration-[var(--transition-normal)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isActive
                      ? 'bg-surface text-text-primary font-semibold shadow-xs border border-border/50'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface/50 font-medium',
                  ].join(' ')
                }
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Contextual Actions & User Account */}
        <div className="flex items-center gap-2">
          {/* Quick Create Project Pill */}
          <button
            type="button"
            onClick={() => navigate('/projects/new')}
            className="hidden sm:inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 px-2.5 py-1.5 text-xs font-semibold transition-colors duration-[var(--transition-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
            title="Create new project"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New</span>
          </button>

          {/* User Account / Sign Out Affordance */}
          <div className="flex items-center gap-1.5 pl-1">
            <div
              className="flex h-8 items-center gap-2 rounded-lg bg-surface-muted/50 px-2 border border-border/50 text-xs font-medium text-text-secondary"
              title={user?.email || 'Authenticated User'}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {userInitial}
              </span>
              <span className="hidden lg:inline text-text-primary max-w-[120px] truncate">
                {userName}
              </span>
            </div>

            <button
              type="button"
              data-testid="header-signout-button"
              onClick={() => signOut()}
              aria-label="Sign out of Lumina"
              title="Sign out"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition-colors duration-[var(--transition-normal)] hover:bg-rose-500/10 hover:text-status-danger hover:border-status-danger/20 border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
