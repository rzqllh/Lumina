import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { ClientForm, useClientMutations, type ClientFormValues } from '@/features/clients';

export function ClientNewRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || searchParams.get('from');
  const { createClient } = useClientMutations();
  const [error, setError] = useState<string | null>(null);

  const handleCancelOrBack = () => {
    if (returnUrl) {
      navigate(returnUrl);
    } else {
      navigate('/clients');
    }
  };

  const handleSubmit = async (values: ClientFormValues) => {
    try {
      setError(null);
      const newClient = await createClient.mutateAsync({
        display_name: values.display_name,
        client_type: values.client_type,
        custom_type_label: values.custom_type_label || null,
        email: values.email || null,
        phone: values.phone || null,
        notes: values.notes || null,
      });

      if (returnUrl) {
        // If returning to a project form, append or include the newly created clientId
        const separator = returnUrl.includes('?') ? '&' : '?';
        navigate(`${returnUrl}${separator}clientId=${newClient.id}`);
      } else {
        navigate(`/clients/${newClient.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 border-b border-border-subtle pb-5">
        <button
          type="button"
          onClick={handleCancelOrBack}
          aria-label={returnUrl ? 'Back' : 'Back to clients'}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Create New Client
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Add a client profile to your workspace.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle sm:p-7">
        <ClientForm
          onSubmit={handleSubmit}
          onCancel={handleCancelOrBack}
          isSubmitting={createClient.isPending}
          serverError={error}
          submitLabel="Create Client"
        />
      </div>
    </div>
  );
}
