import { useState } from 'react';
import { formatIDR } from '@/lib/money';
import { usePackages } from '@/features/catalog';
import type { PackageWithItems } from '@/features/catalog';
import { Package, AlertCircle, X } from 'lucide-react';

interface PackagePickerModalProps {
  onApply: (packageId: string) => void;
  onClose: () => void;
  isApplying?: boolean;
}

export function PackagePickerModal({ onApply, onClose, isApplying }: PackagePickerModalProps) {
  const { data: allPackages = [], isLoading, error } = usePackages(true);
  const activePackages = allPackages;

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const selectedPackage = activePackages.find((p) => p.id === selectedPackageId);

  // Compute catalog total from package items
  function getPackageCatalogTotal(pkg: PackageWithItems): number {
    return (pkg.package_items ?? []).reduce(
      (acc, item) => acc + item.quantity * item.unit_price,
      0
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Apply package to project"
      data-testid="package-picker-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-surface shadow-sheet flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary-text" aria-hidden="true" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-text-primary">Apply Package</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close package picker"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="space-y-2 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-muted/50" />
              ))}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 p-4 text-xs font-medium text-status-danger-text bg-status-danger-subtle"
            >
              <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span>Could not load packages. Please close and try again.</span>
            </div>
          )}

          {!isLoading && !error && activePackages.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Package className="h-8 w-8 text-text-muted mb-3" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-text-primary">No active packages</p>
              <p className="mt-1 text-xs text-text-muted max-w-xs">
                Create packages in the Packages catalog before applying them to a project.
              </p>
            </div>
          )}

          {!isLoading && activePackages.length > 0 && (
            <div className="p-4 space-y-2">
              {activePackages.map((pkg) => {
                const catalogTotal = getPackageCatalogTotal(pkg);
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    data-testid={`package-picker-option-${pkg.id}`}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    aria-pressed={isSelected}
                    className={`w-full text-left cursor-pointer rounded-lg border px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isSelected
                        ? 'border-primary-border bg-primary-subtle ring-1 ring-primary/30'
                        : 'border-border bg-surface hover:bg-surface-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-semibold text-text-primary truncate">
                          {pkg.name}
                        </span>
                        {pkg.description && (
                          <span className="block text-xs text-text-muted truncate mt-0.5">
                            {pkg.description}
                          </span>
                        )}
                        <span className="block text-xs text-text-secondary mt-1 tabular-nums">
                          {pkg.package_items?.length ?? 0} items
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-xs font-semibold tabular-nums text-text-primary">
                          {formatIDR(catalogTotal)}
                        </span>
                        <span className="block text-[10px] text-text-muted mt-0.5">
                          catalog total
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Item preview for selected package */}
          {selectedPackage && (selectedPackage.package_items?.length ?? 0) > 0 && (
            <div className="border-t border-border-subtle px-4 pb-4 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Items in this package
              </p>
              <div className="space-y-1.5">
                {selectedPackage.package_items!.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-surface-muted px-3 py-2"
                  >
                    <span className="text-xs text-text-secondary truncate flex-1">
                      {item.label}
                    </span>
                    <span className="text-xs tabular-nums text-text-primary font-medium shrink-0">
                      {item.quantity} × {formatIDR(item.unit_price)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-text-muted">
                Each item will be added as an independent pricing snapshot line. Applying again will
                append another set.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-border px-5 py-4 bg-surface-muted/30 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="flex-1 cursor-pointer rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="apply-package-btn"
            onClick={() => selectedPackageId && onApply(selectedPackageId)}
            disabled={!selectedPackageId || isApplying}
            className="flex-1 cursor-pointer rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-subtle hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {isApplying ? 'Applying…' : 'Apply Package'}
          </button>
        </div>
      </div>
    </div>
  );
}
