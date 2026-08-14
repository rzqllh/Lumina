import React from 'react';
import { useNavigate } from 'react-router';
import { Plus, UserPlus } from 'lucide-react';

export const QuickActionBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div data-testid="quick-action-bar" className="flex items-center gap-2">
      <button
        type="button"
        data-testid="quick-action-new-project"
        onClick={() => navigate('/projects/new')}
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[var(--radius-input)] bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-colors duration-[var(--transition-normal)] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" />
        <span>New Project</span>
      </button>
      <button
        type="button"
        data-testid="quick-action-new-client"
        onClick={() => navigate('/clients/new')}
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[var(--radius-input)] border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-primary transition-colors duration-[var(--transition-normal)] hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
      >
        <UserPlus className="h-4 w-4" />
        <span>Add Client</span>
      </button>
    </div>
  );
};
