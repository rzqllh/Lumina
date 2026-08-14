import React from 'react';
import { useNavigate } from 'react-router';
import { Package as PackageIcon, Copy, Edit2, Layers } from 'lucide-react';
import { formatIDR } from '@/lib/money';
import type { PackageWithItems } from '../types/catalogTypes';

interface PackageCardProps {
  pkg: PackageWithItems;
  onDuplicate: (pkgId: string) => void;
  isDuplicating?: boolean;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  onDuplicate,
  isDuplicating = false,
}) => {
  const navigate = useNavigate();

  return (
    <div
      data-testid={`package-card-${pkg.id}`}
      className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:border-primary/40 hover:bg-surface-muted/30"
    >
      <div>
        {/* Header: Title and Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-primary border border-purple-200 shrink-0">
              <PackageIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">{pkg.name}</h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
                <span className="flex items-center gap-1 font-medium">
                  <Layers className="h-3 w-3" />
                  {pkg.package_items.length} {pkg.package_items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${
              pkg.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-zinc-100 text-zinc-600 border-zinc-200'
            }`}
          >
            {pkg.is_active ? 'Active' : 'Archived'}
          </span>
        </div>

        {/* Description */}
        {pkg.description && (
          <p className="mt-3 text-xs text-text-secondary line-clamp-2">{pkg.description}</p>
        )}

        {/* Line item snippets */}
        <div className="mt-3 space-y-1 rounded-xl bg-surface-muted/40 p-2.5 border border-border-subtle text-xs text-text-secondary">
          {pkg.package_items.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span className="truncate max-w-[160px] text-text-primary">
                {item.quantity}× {item.label}
              </span>
              <span className="text-text-muted">{formatIDR(item.quantity * item.unit_price)}</span>
            </div>
          ))}
          {pkg.package_items.length > 3 && (
            <div className="text-[10px] font-medium text-text-muted pt-1 border-t border-border-subtle">
              +{pkg.package_items.length - 3} more items...
            </div>
          )}
        </div>
      </div>

      {/* Footer: Total and Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-text-muted">Preset Total</span>
          <span className="text-sm font-bold text-primary">{formatIDR(pkg.calculated_total)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid={`duplicate-package-${pkg.id}`}
            onClick={() => onDuplicate(pkg.id)}
            disabled={isDuplicating}
            title="Duplicate package"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            data-testid={`edit-package-${pkg.id}`}
            onClick={() => navigate(`/packages/${pkg.id}/edit`)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
