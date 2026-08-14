import React from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle,
  CheckCircle2,
  Receipt,
  FileBox,
  CheckSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { formatMoney } from '@/lib/money';
import type { AttentionItem } from '../types';

interface NeedsAttentionCardProps {
  items: AttentionItem[];
  currency?: string;
  isLoading?: boolean;
}

export const NeedsAttentionCard: React.FC<NeedsAttentionCardProps> = ({
  items,
  currency = 'IDR',
  isLoading = false,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="h-40 animate-pulse rounded-[var(--radius-card)] border border-border bg-surface-muted/50" />
    );
  }

  const getItemIcon = (type: AttentionItem['type']) => {
    switch (type) {
      case 'overdue_payment':
        return <Receipt className="h-4 w-4 text-status-danger" />;
      case 'overdue_deliverable':
        return <FileBox className="h-4 w-4 text-status-danger" />;
      case 'revision_requested':
        return <Sparkles className="h-4 w-4 text-status-warning" />;
      case 'overdue_task':
      default:
        return <CheckSquare className="h-4 w-4 text-status-danger" />;
    }
  };

  const allClear = items.length === 0;

  return (
    <div
      data-testid="needs-attention-panel"
      className="rounded-[var(--radius-card)] border border-border bg-surface p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              allClear ? 'bg-emerald-50 text-status-success' : 'bg-rose-50 text-status-danger'
            }`}
          >
            {allClear ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Needs Attention</h3>
            <p className="text-xs text-text-secondary">
              {allClear
                ? 'Everything on schedule'
                : `${items.length} ${items.length === 1 ? 'item requires' : 'items require'} action`}
            </p>
          </div>
        </div>

        {!allClear && (
          <span
            data-testid="attention-badge-count"
            className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-status-danger"
          >
            {items.length}
          </span>
        )}
      </div>

      {/* Empty State — simple, no dashed container */}
      {allClear && (
        <div data-testid="attention-empty-state" className="mt-5 text-center py-4">
          <CheckCircle2 className="h-7 w-7 text-status-success mx-auto mb-2" />
          <p className="text-xs font-medium text-text-primary">All caught up</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            No overdue deliverables, unpaid invoices, or revision requests.
          </p>
        </div>
      )}

      {/* Attention Items — divider rows, not card-in-card */}
      {!allClear && (
        <div data-testid="attention-items-list" className="mt-4 divide-y divide-border-subtle">
          {items.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              data-testid={`attention-item-${item.id}`}
              onClick={() => navigate(`/projects/${item.projectId}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/projects/${item.projectId}`);
                }
              }}
              className="group flex items-center justify-between gap-3 py-3 transition-colors hover:bg-surface-muted/30 -mx-2 px-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted mt-0.5">
                  {getItemIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-primary truncate">
                      {item.title}
                    </span>
                    {item.amount !== undefined && (
                      <span className="text-xs font-bold text-status-danger tabular-nums">
                        {formatMoney(item.amount, currency)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <span className="truncate max-w-[140px] font-medium">{item.projectTitle}</span>
                    <span className="text-text-muted">·</span>
                    <span className="text-status-danger font-medium truncate">{item.subtitle}</span>
                  </div>
                </div>
              </div>

              <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-primary transition-colors shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
