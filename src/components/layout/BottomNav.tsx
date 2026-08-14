import React from 'react';
import { NavLink } from 'react-router';
import { Sparkles, Calendar, FolderKanban, Users, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const tabs = [
    { to: '/', label: 'Overview', icon: Sparkles },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/calendar', label: 'Schedule', icon: Calendar },
    { to: '/clients', label: 'Clients', icon: Users },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-xs"
    >
      <div className="grid h-16 grid-cols-5 items-stretch">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `group relative flex flex-col items-center justify-center gap-1 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Subtle top indicator bar for active destination */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
                    />
                  )}
                  <Icon className={`h-5 w-5 transition-transform group-active:scale-95 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'}`} />
                  <span className="text-[11px] tracking-tight leading-none">{tab.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
