import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { PackageForm, usePackageMutations, type PackageFormValues } from '@/features/catalog';

export function PackageNewRoute() {
  const navigate = useNavigate();
  const { createPackage } = usePackageMutations();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: PackageFormValues) => {
    try {
      setError(null);
      await createPackage.mutateAsync({
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
      });

      navigate('/packages');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create package');
    }
  };

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
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Create New Package</h1>
          <p className="text-xs text-text-secondary">
            Assemble a preset commercial bundle with combined line items.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-7">
        <PackageForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/packages')}
          isSubmitting={createPackage.isPending}
          serverError={error}
          submitLabel="Create Package"
        />
      </div>
    </div>
  );
}
