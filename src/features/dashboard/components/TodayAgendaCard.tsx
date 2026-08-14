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
import type { TodayItem } from '../types';

interface TodayAgendaCardProps {
  items: TodayItem[];
  currency?: string;
  isLoading?: boolean;
}

export const TodayAgendaCard: React.FC<TodayAgendaCardProps> = ({
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

  const getItemIcon = (type: TodayItem['type']) => {
    switch (type) {
      case 'session':
        return <Camera className="h-4 w-4 text-status-info" />;
      case 'payment':
        return <Receipt className="h-4 w-4 text-status-warning" />;
      case 'task':
      default:
        return <CheckSquare className="h-4 w-4 text-primary" />;
    }
  };

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      data-testid="today-agenda-panel"
      className="rounded-[var(--radius-card)] border border-border bg-surface p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-status-warning">
            <Sun className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Today's Focus</h3>
            <p className="text-xs text-text-secondary">{todayFormatted}</p>
          </div>
        </div>

        {items.length > 0 && (
          <span
            data-testid="today-badge-count"
            className="rounded-full bg-primary/8 px-2.5 py-0.5 text-xs font-bold text-primary"
          >
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div data-testid="today-empty-state" className="mt-5 text-center py-4">
          <Calendar className="h-7 w-7 text-text-muted mx-auto mb-2" />
          <p className="text-xs font-medium text-text-primary">Nothing scheduled for today</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            Enjoy your focus time for editing or pre-production planning.
          </p>
        </div>
      )}

      {/* Today Items — divider rows */}
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
                      <span className="text-xs font-bold text-status-success tabular-nums">
                        {formatMoney(item.amount, currency)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-text-secondary">
                    <span className="truncate max-w-[140px] font-medium">{item.projectTitle}</span>
                    {item.timeOrStatus && (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Clock className="h-3 w-3" />
                        {item.timeOrStatus}
                      </span>
                    )}
                    {item.location && (
                      <span className="flex items-center gap-1 text-text-secondary truncate max-w-[140px]">
                        <MapPin className="h-3 w-3 text-text-muted" />
                        {item.location}
                      </span>
                    )}
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
