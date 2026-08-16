import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, UserPlus, UserCheck } from 'lucide-react';
import { collaboratorFormSchema, type CollaboratorFormValues } from '../schemas/financeSchemas';
import type { Collaborator } from '../types';

interface CollaboratorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CollaboratorFormValues) => Promise<void>;
  initialData?: Collaborator | null;
  isSubmitting?: boolean;
}

export const CollaboratorFormModal: React.FC<CollaboratorFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CollaboratorFormValues>({
    resolver: zodResolver(collaboratorFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      specialty: initialData?.specialty || '',
      notes: initialData?.notes || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          phone: initialData.phone || '',
          email: initialData.email || '',
          specialty: initialData.specialty || '',
          notes: initialData.notes || '',
        });
      } else {
        reset({
          name: '',
          phone: '',
          email: '',
          specialty: '',
          notes: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: CollaboratorFormValues) => {
    await onSubmit(values);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="collaborator-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary-text border border-primary-border">
              {isEditing ? (
                <UserCheck className="h-5 w-5" strokeWidth={1.75} />
              ) : (
                <UserPlus className="h-5 w-5" strokeWidth={1.75} />
              )}
            </div>
            <div>
              <h2 id="collaborator-modal-title" className="text-base font-bold text-text-primary">
                {isEditing ? 'Edit Crew Member' : 'Add Crew / Collaborator'}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing
                  ? 'Update collaborator contact details'
                  : 'Add a reusable collaborator to your workspace roodex'}
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-collaborator-modal-btn"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="collab-name"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Full Name <span className="text-status-danger">*</span>
            </label>
            <input
              id="collab-name"
              data-testid="collaborator-name-input"
              type="text"
              placeholder="e.g., Jane Doe, John Cine"
              {...register('name')}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-status-danger">{errors.name.message}</p>
            )}
          </div>

          {/* Specialty / Role */}
          <div>
            <label
              htmlFor="collab-specialty"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Primary Specialty / Skill
            </label>
            <input
              id="collab-specialty"
              data-testid="collaborator-specialty-input"
              type="text"
              placeholder="e.g., Second Shooter, Drone Operator, Colorist, Editor"
              {...register('specialty')}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.specialty && (
              <p className="mt-1 text-xs text-status-danger">{errors.specialty.message}</p>
            )}
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone */}
            <div>
              <label
                htmlFor="collab-phone"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                Phone
              </label>
              <input
                id="collab-phone"
                data-testid="collaborator-phone-input"
                type="tel"
                placeholder="+62 812..."
                {...register('phone')}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-status-danger">{errors.phone.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="collab-email"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                Email
              </label>
              <input
                id="collab-email"
                data-testid="collaborator-email-input"
                type="email"
                placeholder="crew@example.com"
                {...register('email')}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-status-danger">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="collab-notes"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Notes & Equipment
            </label>
            <textarea
              id="collab-notes"
              data-testid="collaborator-notes-input"
              rows={2}
              placeholder="Gear owned, day rate notes, availability preferences..."
              {...register('notes')}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="submit-collaborator-btn"
              disabled={isSubmitting}
              className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Collaborator' : 'Save Collaborator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
