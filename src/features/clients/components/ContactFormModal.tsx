import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { contactFormSchema, type ContactFormValues } from '../schemas/clientSchemas';
import type { ClientContact } from '../types/clientTypes';

interface ContactFormModalProps {
  isOpen: boolean;
  contact?: ClientContact | null;
  onClose: () => void;
  onSubmit: (values: ContactFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  contact,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const isEdit = !!contact;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      role_label: '',
      email: '',
      phone: '',
      notes: '',
      is_primary: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (contact) {
        reset({
          name: contact.name,
          role_label: contact.role_label || '',
          email: contact.email || '',
          phone: contact.phone || '',
          notes: contact.notes || '',
          is_primary: contact.is_primary || false,
        });
      } else {
        reset({
          name: '',
          role_label: '',
          email: '',
          phone: '',
          notes: '',
          is_primary: false,
        });
      }
    }
  }, [isOpen, contact, reset]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sheet sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 id="contact-modal-title" className="text-base font-semibold text-text-primary">
              {isEdit ? 'Edit Contact' : 'Add Person Contact'}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {isEdit ? 'Update contact details for this client.' : 'Add a new contact person.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="contact_name"
              className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1"
            >
              Full Name <span className="text-status-danger-text">*</span>
            </label>
            <input
              id="contact_name"
              type="text"
              placeholder="e.g. Sarah Jenkins"
              {...register('name')}
              className={`w-full rounded-lg border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                errors.name ? 'border-status-danger-border' : 'border-border'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-status-danger-text">{errors.name.message}</p>
            )}
          </div>

          {/* Role Label */}
          <div>
            <label
              htmlFor="role_label"
              className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1"
            >
              Role / Relationship
            </label>
            <input
              id="role_label"
              type="text"
              placeholder="e.g. Bride / Groom / Event PIC / Marketing Director"
              {...register('role_label')}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="contact_email"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1"
              >
                Email
              </label>
              <input
                id="contact_email"
                type="email"
                placeholder="sarah@example.com"
                {...register('email')}
                className={`w-full rounded-lg border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                  errors.email ? 'border-status-danger-border' : 'border-border'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-status-danger-text">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="contact_phone"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1"
              >
                Phone
              </label>
              <input
                id="contact_phone"
                type="tel"
                placeholder="+62 812-3456-7890"
                {...register('phone')}
                className="w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="contact_notes"
              className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1"
            >
              Contact Notes
            </label>
            <textarea
              id="contact_notes"
              rows={2}
              placeholder="Preferred contact hours, assistant notes, etc."
              {...register('notes')}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Primary Contact Toggle */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              id="is_primary"
              type="checkbox"
              {...register('is_primary')}
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
            />
            <label
              htmlFor="is_primary"
              className="text-xs font-medium text-text-primary cursor-pointer"
            >
              Set as primary contact for this client
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="save-contact-button"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-subtle hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? 'Update Contact' : 'Add Contact'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
