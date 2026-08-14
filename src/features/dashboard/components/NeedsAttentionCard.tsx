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
      <div className="h-44 animate-pulse rounded-2xl border border-border bg-surface-muted/50" />
    );
  }

  const getItemIcon = (type: AttentionItem['type']) => {
    switch (type) {
      case 'overdue_payment':
        return <Receipt className="h-4 w-4 text-rose-600" />;
      case 'overdue_deliverable':
        return <FileBox className="h-4 w-4 text-rose-600" />;
      case 'revision_requested':
        return <Sparkles className="h-4 w-4 text-amber-600" />;
      case 'overdue_task':
      default:
        return <CheckSquare className="h-4 w-4 text-rose-600" />;
    }
  };

  return (
    <div
      data-testid="needs-attention-panel"
      className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              items.length > 0
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}
          >
            {items.length > 0 ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Needs Attention</h3>
            <p className="text-[11px] text-text-muted">
              {items.length > 0
                ? `${items.length} urgent action ${items.length === 1 ? 'item' : 'items'} require your review`
                : 'Everything is on schedule and up to date'}
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <span
            data-testid="attention-badge-count"
            className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-xs font-bold text-rose-700"
          >
            {items.length}
          </span>
        )}
      </div>

      {/* Empty State: All Clear */}
      {items.length === 0 && (
        <div
          data-testid="attention-empty-state"
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-200/60 bg-emerald-50/30 p-6 text-center"
        >
          <CheckCircle2 className="h-8 w-8 text-emerald-600 mb-1.5" />
          <h4 className="text-xs font-bold text-text-primary">All caught up!</h4>
          <p className="mt-0.5 max-w-xs text-[11px] text-text-muted">
            No overdue deliverables, unpaid invoices, or unhandled client revision requests.
          </p>
        </div>
      )}

      {/* Attention Items List */}
      {items.length > 0 && (
        <div data-testid="attention-items-list" className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              data-testid={`attention-item-${item.id}`}
              onClick={() => navigate(`/projects/${item.projectId}`)}
              className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 transition-all hover:border-border-subtle hover:bg-surface-muted/30 cursor-pointer"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted border border-border-subtle mt-0.5">
                  {getItemIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary truncate">
                      {item.title}
                    </span>
                    {item.amount !== undefined && (
                      <span className="text-xs font-bold text-rose-700">
                        {formatMoney(item.amount, currency)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-text-muted">
                    <span className="truncate max-w-[120px] font-medium text-text-secondary">
                      {item.projectTitle}
                    </span>
                    <span>•</span>
                    <span className="text-rose-600 font-medium truncate">{item.subtitle}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center text-text-muted group-hover:text-primary transition-colors">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
