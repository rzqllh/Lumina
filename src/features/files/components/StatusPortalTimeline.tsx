import React from 'react';
import { Check, CircleDot, Circle } from 'lucide-react';

interface StatusPortalTimelineProps {
  stages: Array<{
    id: string;
    label: string;
    position: number;
    status: 'not_started' | 'active' | 'completed' | 'skipped';
  }>;
}

export const StatusPortalTimeline: React.FC<StatusPortalTimelineProps> = ({ stages }) => {
  if (stages.length === 0) return null;

  return (
    <div
      data-testid="status-portal-timeline"
      className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6"
    >
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Production Pipeline
        </h3>
        <span className="text-xs text-text-muted">
          {stages.filter((s) => s.status === 'completed').length} of {stages.length} milestones
          completed
        </span>
      </div>

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {stages.map((stage, idx) => {
          const isCompleted = stage.status === 'completed';
          const isActive = stage.status === 'active';

          return (
            <div
              key={stage.id}
              data-testid={`timeline-stage-${stage.id}`}
              className="flex items-center sm:flex-col sm:items-center gap-3 sm:gap-2 flex-1 relative"
            >
              {/* Connector line (desktop) */}
              {idx < stages.length - 1 && (
                <div
                  className={`hidden sm:block absolute top-4 left-[50%] right-[-50%] h-0.5 -z-10 ${
                    isCompleted ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}

              {/* Node Icon */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                  isCompleted
                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                    : isActive
                      ? 'border-primary bg-primary/10 text-primary ring-4 ring-primary/20'
                      : 'border-border bg-surface text-text-muted'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : isActive ? (
                  <CircleDot className="h-4 w-4 animate-pulse" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>

              {/* Stage Text */}
              <div className="space-y-0.5 sm:text-center">
                <span
                  className={`text-xs font-bold block truncate ${
                    isActive
                      ? 'text-primary'
                      : isCompleted
                        ? 'text-text-primary'
                        : 'text-text-muted'
                  }`}
                >
                  {stage.label}
                </span>
                <span className="text-[10px] capitalize font-medium text-text-muted">
                  {stage.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
