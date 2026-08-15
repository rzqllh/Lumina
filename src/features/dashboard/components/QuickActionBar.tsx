import React from 'react';
import { useNavigate } from 'react-router';
import { Plus, UserPlus } from 'lucide-react';

export const QuickActionBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div data-testid="quick-action-bar" className="flex items-center gap-2.5">
      <button
        type="button"
        data-testid="quick-action-new-project"
        onClick={() => navigate('/projects/new')}
        className="inline-flex min-h-[38px] sm:min-h-[40px] cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-all duration-[var(--transition-fast)] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>New Project</span>
      </button>
      <button
        type="button"
        data-testid="quick-action-new-client"
        onClick={() => navigate('/clients/new')}
        className="inline-flex min-h-[38px] sm:min-h-[40px] cursor-pointer items-center gap-2 rounded-xl border border-border/90 bg-surface px-3.5 py-2 text-xs font-semibold text-text-primary shadow-2xs transition-all duration-[var(--transition-fast)] hover:bg-surface-muted/60 hover:border-border-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
      >
        <UserPlus className="h-3.5 w-3.5 text-text-secondary" />
        <span>Add Client</span>
      </button>
    </div>
  );
};
