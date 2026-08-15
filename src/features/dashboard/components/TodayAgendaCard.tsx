import React from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar,
  Camera,
  CheckSquare,
  Receipt,
  MapPin,
  Clock,
  ArrowRight,
  Sun,
} from 'lucide-react';
import { formatMoney } from '@/lib/money';
import { EmptyState } from '@/components/ui/empty-state';
import type { TodayItem } from '../types';

/**
 * DASH-003 — TodayAgendaCard
 * Presents existing agenda data clearly: time, type, project, location, status.
 * No renaming to "Call Sheet" — Lumina does not model call sheets.
 */

interface TodayAgendaCardProps {
  items: TodayItem[];
  currency?: string;
  isLoading?: boolean;
}

const getItemIcon = (type: TodayItem['type']) => {
  switch (type) {
    case 'session':
      return <Camera className="h-4 w-4" strokeWidth={1.75} />;
    case 'payment':
      return <Receipt className="h-4 w-4" strokeWidth={1.75} />;
    case 'task':
    default:
      return <CheckSquare className="h-4 w-4" strokeWidth={1.75} />;
  }
};

const getItemIconAccent = (type: TodayItem['type']) => {
  switch (type) {
    case 'session':
      return 'bg-status-info-subtle text-status-info-text border-status-info-border';
    case 'payment':
      return 'bg-status-warning-subtle text-status-warning-text border-status-warning-border';
    case 'task':
    default:
      return 'bg-primary-subtle text-primary-text border-primary-border';
  }
};

export const TodayAgendaCard: React.FC<TodayAgendaCardProps> = ({
  items,
  currency = 'IDR',
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="h-40 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
    );
  }

  return (
    <div data-testid="today-agenda-panel" className="surface-level-2 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-status-warning-subtle text-status-warning-text border-status-warning-border">
            <Sun className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary tracking-tight">
              Today's Schedule
            </h2>
            <p className="text-xs text-text-secondary">{todayFormatted}</p>
          </div>
        </div>

        {items.length > 0 && (
          <span
            data-testid="today-badge-count"
            className="rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums bg-primary-subtle text-primary-text border-primary-border"
          >
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="mt-4">
          <EmptyState
            icon={Calendar}
            title="Nothing scheduled today"
            description="Enjoy your focus time for editing or pre-production planning."
            variant="section"
            testId="today-empty-state"
          />
        </div>
      )}

      {/* Today items */}
      {items.length > 0 && (
        <div data-testid="today-items-list" className="mt-4 divide-y divide-border-subtle">
          {items.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              data-testid={`today-item-${item.id}`}
              onClick={() => navigate(`/projects/${item.projectId}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/projects/${item.projectId}`);
                }
              }}
              className="group flex items-center justify-between gap-3 py-3 -mx-2 px-2.5 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ transition: `background-color var(--duration-fast) var(--ease-standard)` }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--color-surface-muted)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                  className={[
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border mt-0.5',
                    getItemIconAccent(item.type),
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
                      <span className="text-xs font-bold text-status-success-text tabular-nums">
                        {formatMoney(item.amount, currency)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-text-secondary">
                    <span className="truncate max-w-[150px] font-medium text-text-primary">
                      {item.projectTitle}
                    </span>
                    {item.timeOrStatus && (
                      <span className="inline-flex items-center gap-1 rounded-md border px-1.5 py-px text-[11px] font-semibold bg-primary-subtle text-primary-text border-primary-border">
                        <Clock className="h-3 w-3" strokeWidth={1.75} />
                        {item.timeOrStatus}
                      </span>
                    )}
                    {item.location && (
                      <span className="inline-flex items-center gap-1 text-text-secondary truncate max-w-[140px]">
                        <MapPin className="h-3 w-3 text-text-muted shrink-0" strokeWidth={1.75} />
                        {item.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <ArrowRight
                className="h-3.5 w-3.5 text-text-muted shrink-0"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
