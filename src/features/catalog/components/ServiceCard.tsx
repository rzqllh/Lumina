import React from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, Edit2 } from 'lucide-react';
import { formatIDR } from '@/lib/money';
import { StatusBadge } from '@/components/ui/status-badge';
import type { Service } from '../types/catalogTypes';

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const navigate = useNavigate();

  return (
    <div
      data-testid={`service-card-${service.id}`}
      className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-subtle transition-all hover:border-border-interactive hover:bg-surface-muted/30"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary-text border border-primary-border shrink-0">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">{service.label}</h3>
              <p className="text-xs font-semibold tabular-nums text-primary-text mt-0.5">
                {formatIDR(service.default_unit_price)}
                <span className="text-xs font-normal text-text-muted"> / unit</span>
              </p>
            </div>
          </div>

          <StatusBadge
            variant={service.is_active ? 'active' : 'archived'}
            label={service.is_active ? 'Active' : 'Archived'}
          />
        </div>

        {service.description && (
          <p className="mt-3 text-xs text-text-secondary line-clamp-2">{service.description}</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end border-t border-border-subtle pt-3">
        <button
          type="button"
          data-testid={`edit-service-${service.id}`}
          onClick={() => navigate(`/services/${service.id}/edit`)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Edit Service</span>
        </button>
      </div>
    </div>
  );
};
