import { useState } from 'react';
import { useServices } from '@/features/catalog';
import { useProjectServices } from '../hooks/useProjectServices';
import { useProjectServiceMutations } from '../hooks/useProjectServiceMutations';
import { ProjectServiceRow } from './ProjectServiceRow';
import { PricingSummary } from './PricingSummary';
import { ProjectServiceForm } from './ProjectServiceForm';
import { PackagePickerModal } from './PackagePickerModal';
import type { ProjectService, ServicePickerItem } from '../types/projectPricingTypes';
import type { ProjectServiceFormValues } from '../schemas/projectPricingSchemas';
import { AlertCircle, Plus, Package, Coins } from 'lucide-react';

interface ProjectPricingSectionProps {
  projectId: string;
}

type PricingView =
  | { mode: 'list' }
  | { mode: 'add-service'; prefill?: ServicePickerItem }
  | { mode: 'edit'; projectService: ProjectService }
  | { mode: 'confirm-remove'; projectService: ProjectService }
  | { mode: 'pick-package' };

export function ProjectPricingSection({ projectId }: ProjectPricingSectionProps) {
  const { data: projectServices = [], isLoading, error, refetch } = useProjectServices(projectId);
  const {
    addServiceSnapshotMutation,
    addCustomLineMutation,
    updateMutation,
    removeMutation,
    applyPackageMutation,
  } = useProjectServiceMutations(projectId);

  const { data: allServices = [] } = useServices(true); // activeOnly = true
  const availableServiceItems: ServicePickerItem[] = allServices.map((s) => ({
    id: s.id,
    label: s.label,
    default_unit_price: s.default_unit_price,
    description: s.description,
  }));

  const [view, setView] = useState<PricingView>({ mode: 'list' });

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function handleAddSubmit(values: ProjectServiceFormValues) {
    if (view.mode === 'edit') {
      updateMutation.mutate(
        {
          id: view.projectService.id,
          input: {
            label: values.label,
            description: values.description ?? null,
            quantity: values.quantity,
            unit_price: values.unit_price,
            adjustment_label: values.adjustment_label ?? null,
            adjustment_amount: values.adjustment_amount,
          },
        },
        { onSuccess: () => setView({ mode: 'list' }) }
      );
    } else {
      if (values.source_service_id) {
        addServiceSnapshotMutation.mutate(
          {
            label: values.label,
            description: values.description ?? null,
            quantity: values.quantity,
            unit_price: values.unit_price,
            source_service_id: values.source_service_id,
          },
          { onSuccess: () => setView({ mode: 'list' }) }
        );
      } else {
        addCustomLineMutation.mutate(
          {
            label: values.label,
            description: values.description ?? null,
            quantity: values.quantity,
            unit_price: values.unit_price,
          },
          { onSuccess: () => setView({ mode: 'list' }) }
        );
      }
    }
  }

  function handleApplyPackage(packageId: string) {
    applyPackageMutation.mutate(packageId, {
      onSuccess: () => setView({ mode: 'list' }),
    });
  }

  function handleConfirmRemove() {
    if (view.mode !== 'confirm-remove') return;
    removeMutation.mutate(view.projectService.id, {
      onSuccess: () => setView({ mode: 'list' }),
    });
  }

  const isMutating =
    addServiceSnapshotMutation.isPending ||
    addCustomLineMutation.isPending ||
    updateMutation.isPending ||
    removeMutation.isPending ||
    applyPackageMutation.isPending;

  const mutationError =
    addServiceSnapshotMutation.error?.message ||
    addCustomLineMutation.error?.message ||
    updateMutation.error?.message ||
    removeMutation.error?.message ||
    applyPackageMutation.error?.message;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <section aria-labelledby="pricing-section-heading">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 mt-6">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2
            id="pricing-section-heading"
            className="text-xs font-bold uppercase tracking-wider text-text-muted"
          >
            Pricing & Services
          </h2>
        </div>

        {view.mode === 'list' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="apply-package-cta"
              onClick={() => setView({ mode: 'pick-package' })}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-text-secondary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <Package className="h-3 w-3" aria-hidden="true" />
              Apply Package
            </button>
            <button
              type="button"
              data-testid="add-service-cta"
              onClick={() => setView({ mode: 'add-service' })}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-xs hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors active:scale-[0.99]"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              Add Service
            </button>
          </div>
        )}
      </div>

      {/* Mutation error */}
      {mutationError && (
        <div
          role="alert"
          className="mb-3 flex items-start gap-2 rounded-xl border border-status-danger/25 bg-status-danger/5 px-3 py-2.5 text-xs text-status-danger"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{mutationError}</span>
        </div>
      )}

      {/* Main list view */}
      {view.mode === 'list' && (
        <>
          {isLoading && (
            <div
              data-testid="pricing-loading"
              className="space-y-2"
              aria-label="Loading project services"
            >
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-muted" />
              ))}
            </div>
          )}

          {error && !isLoading && (
            <div
              role="alert"
              data-testid="pricing-error"
              className="flex flex-col items-center justify-center rounded-2xl border border-status-danger/25 bg-surface p-6 text-center"
            >
              <AlertCircle className="h-6 w-6 text-status-danger mb-2" />
              <p className="text-xs text-text-secondary mb-3">{error.message}</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && projectServices.length === 0 && (
            <div
              data-testid="pricing-empty"
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted/40 px-6 py-8 text-center"
            >
              <Coins className="h-8 w-8 text-text-muted mb-3" />
              <h3 className="text-sm font-semibold text-text-primary">No pricing set</h3>
              <p className="mt-1 text-xs text-text-muted max-w-xs">
                Add individual services or apply a package template to define this project's value.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  data-testid="empty-state-add-service"
                  onClick={() => setView({ mode: 'add-service' })}
                  className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Add Service
                </button>
                <button
                  type="button"
                  data-testid="empty-state-apply-package"
                  onClick={() => setView({ mode: 'pick-package' })}
                  className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Apply Package
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && projectServices.length > 0 && (
            <div className="space-y-2">
              {projectServices.map((ps) => (
                <ProjectServiceRow
                  key={ps.id}
                  projectService={ps}
                  onEdit={(p) => setView({ mode: 'edit', projectService: p })}
                  onRemove={(p) => setView({ mode: 'confirm-remove', projectService: p })}
                />
              ))}
              <PricingSummary projectServices={projectServices} />
            </div>
          )}
        </>
      )}

      {/* Add / Edit form inline */}
      {(view.mode === 'add-service' || view.mode === 'edit') && (
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">
            {view.mode === 'edit' ? 'Edit Service' : 'Add Service Line'}
          </h3>
          <ProjectServiceForm
            initial={view.mode === 'edit' ? view.projectService : undefined}
            availableServices={view.mode === 'add-service' ? availableServiceItems : []}
            onSubmit={handleAddSubmit}
            onCancel={() => setView({ mode: 'list' })}
            isLoading={isMutating}
          />
        </div>
      )}

      {/* Remove confirmation */}
      {view.mode === 'confirm-remove' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-confirm-title"
          className="rounded-2xl border border-status-danger/25 bg-surface p-5 shadow-xs"
        >
          <h3 id="remove-confirm-title" className="text-sm font-bold text-text-primary mb-1">
            Remove service?
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            <strong>{view.projectService.label}</strong> will be permanently removed from this
            project. No catalog items will be affected.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView({ mode: 'list' })}
              disabled={isMutating}
              className="flex-1 cursor-pointer rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="confirm-remove-btn"
              onClick={handleConfirmRemove}
              disabled={isMutating}
              className="flex-1 cursor-pointer rounded-xl bg-status-danger px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99] disabled:opacity-50"
            >
              {isMutating ? 'Removing…' : 'Remove Service'}
            </button>
          </div>
        </div>
      )}

      {/* Package picker modal */}
      {view.mode === 'pick-package' && (
        <PackagePickerModal
          onApply={handleApplyPackage}
          onClose={() => setView({ mode: 'list' })}
          isApplying={applyPackageMutation.isPending}
        />
      )}
    </section>
  );
}
