import React from 'react';
import { CheckCircle2, Circle, Play, FastForward, RotateCcw, Sparkles } from 'lucide-react';
import type { ProjectWorkflowStage, StageStatus } from '../types';

interface StageCardProps {
  stage: ProjectWorkflowStage;
  index: number;
  onStatusChange: (status: StageStatus) => Promise<void>;
  isUpdating?: boolean;
  disabled?: boolean;
  isSelected?: boolean;
  onSelectStage?: () => void;
}

export const StageCard: React.FC<StageCardProps> = ({
  stage,
  index,
  onStatusChange,
  isUpdating = false,
  disabled = false,
  isSelected = false,
  onSelectStage,
}) => {
  const getStatusStyles = () => {
    switch (stage.status) {
      case 'active':
        return {
          container:
            'bg-status-warning-subtle/50 border-status-warning-border shadow-subtle ring-1 ring-status-warning/20',
          badge: 'bg-status-warning-subtle text-status-warning-text border-status-warning-border',
          badgeIcon: (
            <Play
              className="w-3 h-3 fill-status-warning text-status-warning-text"
              strokeWidth={1.75}
            />
          ),
          label: 'Active',
          numBg: 'bg-status-warning text-primary-foreground font-semibold',
        };
      case 'completed':
        return {
          container: 'bg-status-success-subtle/40 border-status-success-border',
          badge: 'bg-status-success-subtle text-status-success-text border-status-success-border',
          badgeIcon: (
            <CheckCircle2 className="w-3 h-3 text-status-success-text" strokeWidth={1.75} />
          ),
          label: 'Completed',
          numBg: 'bg-status-success text-primary-foreground font-semibold',
        };
      case 'skipped':
        return {
          container: 'bg-surface-muted/40 border-border opacity-70',
          badge: 'bg-surface-muted text-text-secondary border-border-subtle',
          badgeIcon: <FastForward className="w-3 h-3 text-text-muted" strokeWidth={1.75} />,
          label: 'Skipped',
          numBg: 'bg-surface-muted text-text-secondary border border-border',
        };
      case 'not_started':
      default:
        return {
          container: 'bg-surface border-border hover:border-border-interactive',
          badge: 'bg-surface-muted text-text-secondary border-border-subtle',
          badgeIcon: <Circle className="w-3 h-3 text-text-muted" strokeWidth={1.75} />,
          label: 'Not Started',
          numBg: 'bg-surface-muted text-text-secondary border border-border',
        };
    }
  };

  const style = getStatusStyles();

  return (
    <div
      data-testid={`stage-card-${stage.id}`}
      onClick={onSelectStage}
      className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        style.container
      } ${isSelected ? 'ring-2 ring-ring' : ''}`}
    >
      <div>
        {/* Top bar: Stage Number + Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono shrink-0 tabular-nums ${style.numBg}`}
            >
              {index + 1}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-md ${style.badge}`}
            >
              {style.badgeIcon}
              <span>{style.label}</span>
            </span>
          </div>

          {stage.source_template_id && (
            <span
              title="Applied from template"
              className="text-xs text-text-muted flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" strokeWidth={1.75} />
            </span>
          )}
        </div>

        {/* Stage Label */}
        <h4
          className={`text-sm font-semibold tracking-tight mb-3 line-clamp-2 ${
            stage.status === 'skipped' ? 'line-through text-text-muted' : 'text-text-primary'
          }`}
        >
          {stage.label}
        </h4>
      </div>

      {/* Quick Action Controls */}
      {!disabled && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 pt-2 border-t border-border-subtle"
        >
          {stage.status === 'not_started' && (
            <>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange('active')}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-subtle disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Play className="w-3 h-3 fill-current" strokeWidth={1.75} />
                Start
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange('skipped')}
                className="px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Skip
              </button>
            </>
          )}

          {stage.status === 'active' && (
            <>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange('completed')}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-status-success hover:bg-status-success/90 rounded-lg transition-colors shadow-subtle disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                Complete
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange('skipped')}
                className="px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Skip
              </button>
            </>
          )}

          {stage.status === 'completed' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onStatusChange('active')}
              className="inline-flex cursor-pointer items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-status-warning-text hover:bg-status-warning-subtle border border-status-warning-border rounded-lg transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={1.75} />
              Reopen
            </button>
          )}

          {stage.status === 'skipped' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onStatusChange('not_started')}
              className="inline-flex cursor-pointer items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={1.75} />
              Restore
            </button>
          )}
        </div>
      )}
    </div>
  );
};
