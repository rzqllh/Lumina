import React from 'react';
import { NavLink } from 'react-router';
import { Sparkles, Calendar, FolderKanban, Users, Settings } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Overview', icon: Sparkles, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban, end: false },
  { to: '/calendar', label: 'Schedule', icon: Calendar, end: false },
  { to: '/clients', label: 'Clients', icon: Users, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const;

export const BottomNav: React.FC = () => {
  return (
    <nav
      aria-label="Main navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid h-14 grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              aria-label={tab.label}
              className={({ isActive }) =>
                [
                  'relative flex flex-col items-center justify-center gap-0.5 transition-colors duration-[var(--transition-normal)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                  isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active top-bar indicator — non-color-only signal */}
                  <span
                    aria-hidden="true"
                    className={[
                      'absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-primary transition-all duration-[var(--transition-normal)]',
                      isActive ? 'w-6 opacity-100' : 'w-0 opacity-0',
                    ].join(' ')}
                  />
                  {/* Subtle active tint behind icon — second non-color indicator */}
                  <span
                    aria-hidden="true"
                    className={[
                      'flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-[var(--transition-normal)]',
                      isActive ? 'bg-primary/8' : '',
                    ].join(' ')}
                  >
                    <Icon
                      className="h-[18px] w-[18px]"
                      strokeWidth={isActive ? 2.25 : 1.75}
                      aria-hidden="true"
                    />
                  </span>
                  <span
                    className={[
                      'text-[11px] leading-none',
                      isActive ? 'font-semibold' : 'font-medium',
                    ].join(' ')}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
