import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { useClients } from '@/features/clients';
import { projectFormSchema, type ProjectFormValues } from '../schemas/projectSchemas';
import type { ProjectStatus } from '../types/projectTypes';

interface ProjectFormProps {
  initialValues?: Partial<ProjectFormValues>;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
  submitLabel?: string;
  isEdit?: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError = null,
  submitLabel = 'Create Project',
  isEdit = false,
}) => {
  // Query clients in the workspace to populate dropdown
  const { data: clients = [], isLoading: isClientsLoading } = useClients(isEdit);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: initialValues?.title || '',
      client_id: initialValues?.client_id || '',
      project_number: initialValues?.project_number || '',
      status: (initialValues?.status as ProjectStatus) || 'active',
      currency: initialValues?.currency || 'IDR',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div
          role="alert"
          data-testid="project-form-error-alert"
          className="rounded-lg border border-status-danger-border bg-status-danger-subtle p-4 text-xs font-medium text-status-danger-text"
        >
          {serverError}
        </div>
      )}

      {/* Client Selection */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="client_id"
            className="block text-xs font-semibold uppercase tracking-wider text-text-muted"
          >
            Client <span className="text-status-danger-text">*</span>
          </label>
          <Link
            to="/clients/new"
            className="text-xs font-semibold text-primary-text hover:underline"
          >
            + Add New Client
          </Link>
        </div>

        {isClientsLoading ? (
          <div className="h-10 w-full animate-pulse rounded-lg bg-surface-muted/50" />
        ) : (
          <select
            id="client_id"
            data-testid="project-client-select"
            {...register('client_id')}
            className={`w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
              errors.client_id ? 'border-status-danger-border' : 'border-border'
            }`}
          >
            <option value="">Select a client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.display_name} ({c.client_type})
              </option>
            ))}
          </select>
        )}
        {errors.client_id && (
          <p className="mt-1 text-xs text-status-danger-text">{errors.client_id.message}</p>
        )}
        {clients.length === 0 && !isClientsLoading && (
          <p className="mt-1 text-xs text-status-warning-text">
            No clients in workspace yet. Please create a client first.
          </p>
        )}
      </div>

      {/* Project Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
        >
          Project Title <span className="text-status-danger-text">*</span>
        </label>
        <input
          id="title"
          type="text"
          placeholder="e.g. Sarah & Dave Bali Wedding or Summer Lookbook 2026"
          {...register('title')}
          className={`w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
            errors.title ? 'border-status-danger-border' : 'border-border'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-status-danger-text">{errors.title.message}</p>
        )}
      </div>

      {/* Project Number & Status Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="project_number"
            className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Project Reference / Number
          </label>
          <input
            id="project_number"
            type="text"
            placeholder="e.g. PRJ-2026-001"
            {...register('project_number')}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
          >
            System Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            {isEdit && <option value="archived">Archived</option>}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="project-submit-btn"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  );
};
