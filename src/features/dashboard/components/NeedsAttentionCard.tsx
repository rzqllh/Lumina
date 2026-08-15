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
      <div className="h-44 animate-pulse rounded-2xl border border-border/60 bg-surface-muted/40" />
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
      className={`rounded-2xl border transition-all duration-[var(--transition-normal)] ${
        allClear
          ? 'border-border/80 bg-surface p-5 shadow-2xs'
          : 'border-rose-500/30 bg-surface p-5 shadow-xs ring-1 ring-rose-500/10'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              allClear
                ? 'bg-emerald-500/10 text-status-success border border-emerald-500/20'
                : 'bg-rose-500/10 text-status-danger border border-rose-500/20'
            }`}
          >
            {allClear ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-tight">
              Needs Attention
            </h3>
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
            className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-status-danger tabular-nums"
          >
            {items.length}
          </span>
        )}
      </div>

      {/* Empty State — serene and compact */}
      {allClear && (
        <div
          data-testid="attention-empty-state"
          className="mt-4 flex items-center gap-3 rounded-xl bg-surface-muted/30 border border-border-subtle p-3.5"
        >
          <CheckCircle2 className="h-5 w-5 text-status-success shrink-0" />
          <div className="min-w-0 flex-1 text-xs">
            <span className="font-semibold text-text-primary">All caught up</span>
            <p className="text-text-secondary mt-0.5">
              No overdue deliverables, unpaid invoices, or revision requests.
            </p>
          </div>
        </div>
      )}

      {/* Attention Items — Refined interactive row items */}
      {!allClear && (
        <div data-testid="attention-items-list" className="mt-4 divide-y divide-border-subtle/80">
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
              className="group flex items-center justify-between gap-3 py-3 transition-colors hover:bg-surface-muted/40 -mx-2 px-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted/80 mt-0.5 border border-border/50">
                  {getItemIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
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
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-secondary">
                    <span className="truncate max-w-[160px] font-medium text-text-primary">
                      {item.projectTitle}
                    </span>
                    <span className="text-text-muted">·</span>
                    <span className="text-status-danger font-medium truncate">{item.subtitle}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
