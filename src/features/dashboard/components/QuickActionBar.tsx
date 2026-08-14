import React from 'react';
import { useNavigate } from 'react-router';
import { Plus, UserPlus, Calendar, Layers } from 'lucide-react';

export const QuickActionBar: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'New Project',
      icon: Plus,
      path: '/projects/new',
      primary: true,
      testId: 'quick-action-new-project',
    },
    {
      label: 'New Client',
      icon: UserPlus,
      path: '/clients/new',
      primary: false,
      testId: 'quick-action-new-client',
    },
    {
      label: 'Production Calendar',
      icon: Calendar,
      path: '/calendar',
      primary: false,
      testId: 'quick-action-calendar',
    },
    {
      label: 'Service Catalog',
      icon: Layers,
      path: '/services',
      primary: false,
      testId: 'quick-action-services',
    },
  ];

  return (
    <div data-testid="quick-action-bar" className="flex flex-wrap items-center gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            data-testid={action.testId}
            onClick={() => navigate(action.path)}
            className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-2xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-98 ${
              action.primary
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'border border-border bg-surface text-text-primary hover:bg-surface-muted hover:border-border-interactive'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};
