import React from 'react';
import { NavLink } from 'react-router';
import { Sparkles, Calendar, FolderKanban, Users, Settings } from 'lucide-react';

/**
 * NAV-002 — Bottom Navigation (mobile only, hidden md+)
 * Routes: Overview | Projects | Schedule | Clients | Settings
 * Requirements:
 * - Active route visually obvious (not color-only — also font weight + indicator)
 * - Safe touch targets (44px minimum)
 * - Content not covered by nav (AppShell handles pb clearance)
 * - Quieter than primary page content
 */

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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border-subtle bg-surface-elevated"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        boxShadow: 'var(--shadow-elevated)',
      }}
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
                  'relative flex flex-col items-center justify-center gap-0.5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                  'transition-colors',
                  isActive ? 'text-primary' : 'text-text-muted hover:text-text-primary',
                ].join(' ')
              }
              style={{ transitionDuration: 'var(--duration-fast)' }}
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar — non-color-only signal */}
                  <span
                    aria-hidden="true"
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-primary"
                    style={{
                      width: isActive ? '1.5rem' : '0',
                      opacity: isActive ? 1 : 0,
                      transition:
                        'width var(--duration-fast) var(--ease-standard), opacity var(--duration-fast)',
                    }}
                  />

                  {/* Icon container — subtle active tint */}
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-md"
                    style={{
                      backgroundColor: isActive ? 'oklch(0.960 0.030 272 / 0.12)' : 'transparent',
                      transition: `background-color var(--duration-fast) var(--ease-standard)`,
                    }}
                  >
                    <Icon
                      className="h-[18px] w-[18px]"
                      strokeWidth={isActive ? 2.25 : 1.75}
                      aria-hidden="true"
                    />
                  </span>

                  {/* Label */}
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
