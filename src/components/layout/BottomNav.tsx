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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-lg pb-safe">
      <div className="grid h-14 grid-cols-5 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-1 text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
