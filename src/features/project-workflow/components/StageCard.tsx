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
          container: 'bg-amber-50/40 border-amber-300 shadow-2xs ring-1 ring-amber-300/60',
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          badgeIcon: <Play className="w-3 h-3 fill-amber-700 text-amber-700" />,
          label: 'Active',
          numBg: 'bg-amber-600 text-white font-bold',
        };
      case 'completed':
        return {
          container: 'bg-emerald-50/30 border-emerald-200 opacity-95',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          badgeIcon: <CheckCircle2 className="w-3 h-3 text-emerald-700" />,
          label: 'Completed',
          numBg: 'bg-emerald-600 text-white font-semibold',
        };
      case 'skipped':
        return {
          container: 'bg-surface-muted/40 border-border opacity-70',
          badge: 'bg-surface-muted text-text-secondary border-border',
          badgeIcon: <FastForward className="w-3 h-3 text-text-muted" />,
          label: 'Skipped',
          numBg: 'bg-surface-muted text-text-secondary border border-border',
        };
      case 'not_started':
      default:
        return {
          container: 'bg-surface border-border hover:border-primary/40',
          badge: 'bg-surface-muted text-text-secondary border-border',
          badgeIcon: <Circle className="w-3 h-3 text-text-muted" />,
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
      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <div>
        {/* Top bar: Stage Number + Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono shrink-0 ${style.numBg}`}
            >
              {index + 1}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wide border rounded-full uppercase ${style.badge}`}
            >
              {style.badgeIcon}
              <span>{style.label}</span>
            </span>
          </div>

          {stage.source_template_id && (
            <span
              title="Applied from template"
              className="text-[10px] text-text-muted flex items-center gap-1"
            >
              <Sparkles className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        {/* Stage Label */}
        <h4
          className={`text-sm font-bold tracking-tight mb-3 line-clamp-2 ${
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
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors shadow-xs disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Play className="w-3 h-3 fill-current" />
                Start
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange('skipped')}
                className="px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-md transition-colors disabled:opacity-50 cursor-pointer"
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
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Complete
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange('skipped')}
                className="px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-md transition-colors disabled:opacity-50 cursor-pointer"
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
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50 border border-amber-200 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reopen
            </button>
          )}

          {stage.status === 'skipped' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onStatusChange('not_started')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Restore
            </button>
          )}
        </div>
      )}
    </div>
  );
};
