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
            'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          badgeIcon: <Play className="w-3 h-3 fill-amber-400 text-amber-400" />,
          label: 'Active',
          numBg: 'bg-amber-500 text-neutral-950 font-bold',
        };
      case 'completed':
        return {
          container: 'bg-emerald-950/20 border-emerald-800/40 opacity-90',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          badgeIcon: <CheckCircle2 className="w-3 h-3" />,
          label: 'Completed',
          numBg: 'bg-emerald-500/20 text-emerald-300 font-semibold',
        };
      case 'skipped':
        return {
          container: 'bg-neutral-900/40 border-neutral-800/60 opacity-60',
          badge: 'bg-neutral-800 text-neutral-400 border-neutral-700',
          badgeIcon: <FastForward className="w-3 h-3" />,
          label: 'Skipped',
          numBg: 'bg-neutral-800 text-neutral-500',
        };
      case 'not_started':
      default:
        return {
          container: 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700',
          badge: 'bg-neutral-800/80 text-neutral-400 border-neutral-700',
          badgeIcon: <Circle className="w-3 h-3" />,
          label: 'Not Started',
          numBg: 'bg-neutral-800 text-neutral-400',
        };
    }
  };

  const style = getStatusStyles();

  return (
    <div
      onClick={onSelectStage}
      className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        style.container
      } ${isSelected ? 'ring-2 ring-amber-400/80' : ''}`}
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
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold tracking-wide border rounded-full uppercase ${style.badge}`}
            >
              {style.badgeIcon}
              <span>{style.label}</span>
            </span>
          </div>

          {stage.source_template_id && (
            <span
              title="Applied from template"
              className="text-[10px] text-neutral-500 flex items-center gap-1"
            >
              <Sparkles className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        {/* Stage Label */}
        <h4
          className={`text-sm font-bold tracking-tight mb-3 line-clamp-2 ${
            stage.status === 'skipped' ? 'line-through text-neutral-500' : 'text-neutral-100'
          }`}
        >
          {stage.label}
        </h4>
      </div>

      {/* Quick Action Controls */}
      {!disabled && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 pt-2 border-t border-neutral-800/60"
        >
          {stage.status === 'not_started' && (
            <>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange('active')}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors shadow-sm disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-current" />
                Start
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange('skipped')}
                className="px-2 py-1 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-50"
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
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-3 h-3" />
                Complete
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange('skipped')}
                className="px-2 py-1 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-50"
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
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-md transition-colors disabled:opacity-50"
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
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-50"
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
