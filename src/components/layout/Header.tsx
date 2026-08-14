import React from 'react';
import { NavLink } from 'react-router';
import { Sparkles, Calendar, FolderKanban, Users, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  const navLinks = [
    { to: '/', label: 'Overview', icon: Sparkles },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/calendar', label: 'Schedule', icon: Calendar },
    { to: '/clients', label: 'Clients', icon: Users },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-xs">
            L
          </div>
          <span className="font-semibold tracking-tight text-sm text-[var(--text-primary)]">
            Lumina
          </span>
          <span className="rounded bg-[var(--surface-elevated)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)]">
            v0.1.0
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]'
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
