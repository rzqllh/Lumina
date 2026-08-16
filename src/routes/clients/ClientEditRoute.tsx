import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import {
  useClient,
  useClientMutations,
  ClientForm,
  type ClientFormValues,
} from '@/features/clients';

export function ClientEditRoute() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const { data: client, isLoading, error } = useClient(clientId);
  const { updateClient } = useClientMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: ClientFormValues) => {
    if (!clientId) return;
    try {
      setSubmitError(null);
      await updateClient.mutateAsync({
        clientId,
        input: {
          display_name: values.display_name,
          client_type: values.client_type,
          custom_type_label: values.custom_type_label || null,
          email: values.email || null,
          phone: values.phone || null,
          notes: values.notes || null,
          is_archived: values.is_archived,
        },
      });

      navigate(`/clients/${clientId}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update client');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-surface-muted/60" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center rounded-xl border border-status-danger-border bg-surface p-8 text-center"
      >
        <AlertCircle className="h-8 w-8 text-status-danger-text mb-2" strokeWidth={1.75} />
        <h3 className="text-base font-semibold text-text-primary">Client not found</h3>
        <button
          type="button"
          onClick={() => navigate('/clients')}
          className="mt-4 cursor-pointer rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 border-b border-border-subtle pb-5">
        <button
          type="button"
          onClick={() => navigate(`/clients/${clientId}`)}
          aria-label="Back to client detail"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Edit Client Profile
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Update client details or change archive status.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle sm:p-7">
        <ClientForm
          initialValues={{
            display_name: client.display_name,
            client_type: client.client_type,
            custom_type_label: client.custom_type_label,
            email: client.email,
            phone: client.phone,
            notes: client.notes,
            is_archived: client.is_archived,
          }}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/clients/${clientId}`)}
          isSubmitting={updateClient.isPending}
          serverError={submitError}
          submitLabel="Update Client"
          isEdit
        />
      </div>
    </div>
  );
}
