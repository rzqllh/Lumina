import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { ServiceForm, useServiceMutations, type ServiceFormValues } from '@/features/catalog';

export function ServiceNewRoute() {
  const navigate = useNavigate();
  const { createService } = useServiceMutations();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: ServiceFormValues) => {
    try {
      setError(null);
      await createService.mutateAsync({
        label: values.label,
        default_unit_price: values.default_unit_price,
        description: values.description || null,
        is_active: values.is_active,
      });

      navigate('/services');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create service');
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/services')}
          aria-label="Back to services"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Create New Service</h1>
          <p className="text-xs text-text-secondary">
            Add a service offering and standard default price to your workspace catalog.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-7">
        <ServiceForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/services')}
          isSubmitting={createService.isPending}
          serverError={error}
          submitLabel="Create Service"
        />
      </div>
    </div>
  );
}
