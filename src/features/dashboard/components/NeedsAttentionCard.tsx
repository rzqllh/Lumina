import React from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle,
  CheckCircle2,
  Receipt,
  FileBox,
  CheckSquare,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { formatMoney } from '@/lib/money';
import { EmptyState } from '@/components/ui/empty-state';
import type { AttentionItem } from '../types';

/**
 * DASH-002 — NeedsAttentionCard
 * Strongest operational focal module. Uses existing urgency only.
 * Priority: urgency/status → project/client → context → date/amount → nav affordance.
 * Empty state: compact and calm.
 */

interface NeedsAttentionCardProps {
  items: AttentionItem[];
  currency?: string;
  isLoading?: boolean;
}

const getItemIcon = (type: AttentionItem['type']) => {
  switch (type) {
    case 'overdue_payment':
      return <Receipt className="h-4 w-4" strokeWidth={1.75} />;
    case 'overdue_deliverable':
      return <FileBox className="h-4 w-4" strokeWidth={1.75} />;
    case 'revision_requested':
      return <MessageSquare className="h-4 w-4" strokeWidth={1.75} />;
    case 'overdue_task':
    default:
      return <CheckSquare className="h-4 w-4" strokeWidth={1.75} />;
  }
};

const getItemAccentClass = (type: AttentionItem['type']) => {
  if (type === 'revision_requested') {
    return 'text-status-warning-text bg-status-warning-subtle border-status-warning-border';
  }
  return 'text-status-danger-text bg-status-danger-subtle border-status-danger-border';
};

export const NeedsAttentionCard: React.FC<NeedsAttentionCardProps> = ({
  items,
  currency = 'IDR',
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const allClear = items.length === 0;

  if (isLoading) {
    return (
      <div className="h-40 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
    );
  }

  return (
    <div
      data-testid="needs-attention-panel"
      className={allClear ? 'surface-level-2 p-5' : 'surface-level-1-attention p-5'}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={[
              'flex h-8 w-8 items-center justify-center rounded-lg border',
              allClear
                ? 'bg-status-success-subtle text-status-success-text border-status-success-border'
                : 'bg-status-danger-subtle text-status-danger-text border-status-danger-border',
            ].join(' ')}
          >
            {allClear ? (
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary tracking-tight">
              Needs Attention
            </h2>
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
            className="rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums bg-status-danger-subtle text-status-danger-text border-status-danger-border"
          >
            {items.length}
          </span>
        )}
      </div>

      {/* Empty / all-clear state */}
      {allClear && (
        <div className="mt-4">
          <EmptyState
            icon={CheckCircle2}
            title="All caught up"
            description="No overdue deliverables, unpaid receivables, or revision requests."
            variant="section"
            testId="attention-empty-state"
          />
        </div>
      )}

      {/* Attention item list */}
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
              className="group flex items-center justify-between gap-3 py-3 -mx-2 px-2.5 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                transition: `background-color var(--duration-fast) var(--ease-standard)`,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--color-surface-muted)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                  className={[
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border mt-0.5',
                    getItemAccentClass(item.type),
                  ].join(' ')}
                >
                  {getItemIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-text-primary truncate">
                      {item.title}
                    </span>
                    {item.amount !== undefined && (
                      <span className="text-xs font-bold text-status-danger-text tabular-nums">
                        {formatMoney(item.amount, currency)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-secondary">
                    <span className="truncate max-w-[160px] font-medium text-text-primary">
                      {item.projectTitle}
                    </span>
                    <span className="text-text-muted" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-status-danger-text font-medium truncate">
                      {item.subtitle}
                    </span>
                  </div>
                </div>
              </div>

              <ArrowRight
                className="h-3.5 w-3.5 text-text-muted shrink-0"
                strokeWidth={1.75}
                aria-hidden="true"
                style={{
                  transition: `transform var(--duration-fast) var(--ease-standard)`,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
