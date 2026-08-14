import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import {
  usePackage,
  usePackageMutations,
  PackageForm,
  type PackageFormValues,
} from '@/features/catalog';

export function PackageEditRoute() {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();

  const { data: pkg, isLoading, error } = usePackage(packageId);
  const { updatePackage } = usePackageMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: PackageFormValues) => {
    if (!packageId) return;
    try {
      setSubmitError(null);
      await updatePackage.mutateAsync({
        packageId,
        input: {
          name: values.name,
          description: values.description || null,
          is_active: values.is_active,
          items: values.items.map((item, idx) => ({
            service_id: item.service_id || null,
            label: item.label,
            quantity: item.quantity,
            unit_price: item.unit_price,
            description: item.description || null,
            position: idx,
          })),
        },
      });

      navigate('/packages');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update package');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface-muted/60" />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center rounded-2xl border border-status-danger/25 bg-surface p-8 text-center"
      >
        <AlertCircle className="h-8 w-8 text-status-danger mb-2" />
        <h3 className="text-sm font-bold text-text-primary">Package not found</h3>
        <button
          type="button"
          onClick={() => navigate('/packages')}
          className="mt-4 cursor-pointer rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          Back to Packages
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/packages')}
          aria-label="Back to packages"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Edit Package</h1>
          <p className="text-xs text-text-secondary">
            Update package preset items, quantities, and pricing.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-7">
        <PackageForm
          initialValues={{
            name: pkg.name,
            description: pkg.description,
            is_active: pkg.is_active,
            items: pkg.package_items.map((item) => ({
              id: item.id,
              service_id: item.service_id,
              label: item.label,
              quantity: item.quantity,
              unit_price: item.unit_price,
              description: item.description,
              position: item.position,
            })),
          }}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/packages')}
          isSubmitting={updatePackage.isPending}
          serverError={submitError}
          submitLabel="Update Package"
          isEdit
        />
      </div>
    </div>
  );
}
