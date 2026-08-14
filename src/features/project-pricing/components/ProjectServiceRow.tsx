import { formatIDR } from '@/lib/money';
import { computeNetLineTotal, type ProjectService } from '../types/projectPricingTypes';
import { Edit2, Trash2 } from 'lucide-react';

interface ProjectServiceRowProps {
  projectService: ProjectService;
  onEdit: (ps: ProjectService) => void;
  onRemove: (ps: ProjectService) => void;
}

export function ProjectServiceRow({ projectService: ps, onEdit, onRemove }: ProjectServiceRowProps) {
  const netLineTotal = computeNetLineTotal(ps);
  const hasAdjustment = Boolean(ps.adjustment_label || ps.adjustment_amount !== 0);

  return (
    <div
      data-testid={`project-service-row-${ps.id}`}
      className="rounded-xl border border-border bg-surface px-4 py-3.5 shadow-2xs"
    >
      {/* Label row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-text-primary leading-tight">
            {ps.label}
          </span>
          {ps.description && (
            <span className="block text-xs text-text-muted mt-0.5 leading-snug">
              {ps.description}
            </span>
          )}
        </div>
        {/* Net line total */}
        <span
          data-testid={`net-total-${ps.id}`}
          className="shrink-0 text-sm font-bold tabular-nums text-text-primary"
          aria-label={`Net total: ${formatIDR(netLineTotal)}`}
        >
          {formatIDR(netLineTotal)}
        </span>
      </div>

      {/* Quantity × unit_price */}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="text-xs text-text-secondary tabular-nums">
          {ps.quantity} × {formatIDR(ps.unit_price)}
        </span>
        <span className="text-xs text-text-muted tabular-nums">{formatIDR(ps.subtotal)}</span>
      </div>

      {/* Adjustment row (only shown when present) */}
      {hasAdjustment && (
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-xs text-text-secondary">
            {ps.adjustment_label || 'Adjustment'}
          </span>
          <span
            data-testid={`adjustment-amount-${ps.id}`}
            className="text-xs font-medium tabular-nums text-text-secondary"
          >
            {ps.adjustment_amount < 0
              ? `−${formatIDR(Math.abs(ps.adjustment_amount))}`
              : `+${formatIDR(ps.adjustment_amount)}`}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2 border-t border-border pt-2.5">
        <button
          type="button"
          data-testid={`edit-project-service-${ps.id}`}
          onClick={() => onEdit(ps)}
          aria-label={`Edit ${ps.label}`}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        >
          <Edit2 className="h-3 w-3" aria-hidden="true" />
          Edit
        </button>
        <button
          type="button"
          data-testid={`remove-project-service-${ps.id}`}
          onClick={() => onRemove(ps)}
          aria-label={`Remove ${ps.label}`}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-status-danger/25 bg-surface px-2.5 py-1.5 text-[11px] font-semibold text-status-danger hover:bg-status-danger/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        >
          <Trash2 className="h-3 w-3" aria-hidden="true" />
          Remove
        </button>
      </div>
    </div>
  );
}
