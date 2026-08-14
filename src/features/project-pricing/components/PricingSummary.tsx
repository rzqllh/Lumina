import { formatIDR } from '@/lib/money';
import { computeProjectValue, type ProjectService } from '../types/projectPricingTypes';
import { DollarSign } from 'lucide-react';

interface PricingSummaryProps {
  projectServices: ProjectService[];
}

export function PricingSummary({ projectServices }: PricingSummaryProps) {
  const projectValue = computeProjectValue(projectServices);
  const lineCount = projectServices.length;

  return (
    <div
      className="mt-2 rounded-xl border border-primary/20 bg-purple-50/60 px-4 py-3.5"
      role="region"
      aria-label="Project value summary"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-text-secondary">
          <DollarSign className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wide text-text-secondary">
            Project Value
          </span>
          <span className="text-xs text-text-muted">
            ({lineCount} {lineCount === 1 ? 'service' : 'services'})
          </span>
        </div>
        <span
          data-testid="project-value-total"
          className="text-base font-bold tabular-nums text-primary"
          aria-label={`Project total value: ${formatIDR(projectValue)}`}
        >
          {formatIDR(projectValue)}
        </span>
      </div>
    </div>
  );
}
