import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  Sparkles,
  Calendar,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  Plus,
  ChevronDown,
  UserPlus,
} from 'lucide-react';
import { useAuth, useWorkspace } from '@/lib/auth';

/**
 * NAV-001 — Desktop & Mobile Header
 * Desktop: workspace identity | primary nav | account/actions
 * Mobile: lightweight — no duplication of bottom nav, workspace identity remains
 * Quick Create: Single "+ New" dropdown for Project / Client creation across viewports
 */

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userInitial = (user?.user_metadata?.full_name || user?.email || 'U')
    .charAt(0)
    .toUpperCase();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Studio Owner';

  useEffect(() => {
    if (!isCreateOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsCreateOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCreateOpen]);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border-subtle bg-surface-elevated"
      style={{ boxShadow: 'var(--shadow-subtle)' }}
    >
      <div className="mx-auto flex h-[54px] max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Workspace Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Wordmark — text-only, no camera cliché */}
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-primary-foreground text-xs font-bold shrink-0"
            style={{ background: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            L
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold tracking-tight text-text-primary leading-tight truncate">
              {currentWorkspace?.name || 'Lumina Studio'}
            </span>
            <span className="hidden sm:block text-xs text-text-muted leading-tight truncate">
              Production OS
            </span>
          </div>
        </div>

        {/* NAV-003 — Desktop Primary Navigation */}
        {/* Restrained pill-group; not mobile nav stretched to desktop */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-0.5 rounded-lg border border-border-subtle bg-surface-muted/60 p-1"
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
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium',
                    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-surface text-text-primary font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface/60',
                  ].join(' ')
                }
                style={{ transitionDuration: 'var(--duration-fast)' }}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Contextual Actions & User Account */}
        <div className="flex items-center gap-2">
          {/* Quick Create Dropdown — unified action trigger across desktop & mobile */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              data-testid="header-create-trigger"
              aria-haspopup="menu"
              aria-expanded={isCreateOpen}
              onClick={() => setIsCreateOpen((prev) => !prev)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-primary-border bg-primary-subtle text-primary-text px-2.5 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-primary/10 transition-colors"
              title="Create new project or client"
              aria-label="Create new"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              <span>New</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-150 ${isCreateOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {isCreateOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                data-testid="header-create-menu"
                className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-border-subtle bg-surface-elevated p-1 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <button
                  type="button"
                  role="menuitem"
                  data-testid="header-new-project-item"
                  onClick={() => {
                    setIsCreateOpen(false);
                    navigate('/projects/new');
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-text-primary hover:bg-surface-muted transition-colors text-left"
                >
                  <FolderKanban className="h-3.5 w-3.5 text-text-secondary" strokeWidth={1.75} />
                  <span>New Project</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  data-testid="header-new-client-item"
                  onClick={() => {
                    setIsCreateOpen(false);
                    navigate('/clients/new');
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-text-primary hover:bg-surface-muted transition-colors text-left"
                >
                  <UserPlus className="h-3.5 w-3.5 text-text-secondary" strokeWidth={1.75} />
                  <span>Add Client</span>
                </button>
              </div>
            )}
          </div>

          {/* User identity chip */}
          <div className="flex items-center gap-1.5">
            <div
              className="hidden lg:flex h-7 items-center gap-2 rounded-md border border-border-subtle bg-surface-muted/50 px-2 text-xs font-medium text-text-secondary"
              title={user?.email || 'Authenticated user'}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-primary-foreground text-[10px] font-bold"
                style={{ background: 'var(--color-primary)' }}
                aria-hidden="true"
              >
                {userInitial}
              </span>
              <span className="max-w-[120px] truncate text-text-primary">{userName}</span>
            </div>

            <button
              type="button"
              data-testid="header-signout-button"
              onClick={() => signOut()}
              aria-label="Sign out of Lumina"
              title="Sign out"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-muted border border-transparent hover:border-status-danger-border hover:bg-status-danger-subtle hover:text-status-danger-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ transitionDuration: 'var(--duration-fast)' }}
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
