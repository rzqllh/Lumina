import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import {
  useService,
  useServiceMutations,
  ServiceForm,
  type ServiceFormValues,
} from '@/features/catalog';

export function ServiceEditRoute() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const { data: service, isLoading, error } = useService(serviceId);
  const { updateService } = useServiceMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: ServiceFormValues) => {
    if (!serviceId) return;
    try {
      setSubmitError(null);
      await updateService.mutateAsync({
        serviceId,
        input: {
          label: values.label,
          default_unit_price: values.default_unit_price,
          description: values.description || null,
          is_active: values.is_active,
        },
      });

      navigate('/services');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update service');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface-muted/60" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center rounded-2xl border border-status-danger/25 bg-surface p-8 text-center"
      >
        <AlertCircle className="h-8 w-8 text-status-danger mb-2" />
        <h3 className="text-sm font-bold text-text-primary">Service not found</h3>
        <button
          type="button"
          onClick={() => navigate('/services')}
          className="mt-4 cursor-pointer rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          Back to Services
        </button>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Edit Service</h1>
          <p className="text-xs text-text-secondary">
            Update pricing rate or active catalog status.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-7">
        <ServiceForm
          initialValues={{
            label: service.label,
            default_unit_price: service.default_unit_price,
            description: service.description,
            is_active: service.is_active,
          }}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/services')}
          isSubmitting={updateService.isPending}
          serverError={submitError}
          submitLabel="Update Service"
          isEdit
        />
      </div>
    </div>
  );
}
