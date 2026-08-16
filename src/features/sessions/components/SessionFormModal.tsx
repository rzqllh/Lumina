import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Calendar, MapPin, Tag } from 'lucide-react';
import { sessionFormSchema, type SessionFormValues } from '../schemas/sessionSchemas';
import type { Session, SessionType } from '../types';

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: SessionFormValues) => Promise<void>;
  initialData?: Session | null;
  isSubmitting?: boolean;
}

export const SessionFormModal: React.FC<SessionFormModalProps> = ({
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
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      type: initialData?.type || 'shoot',
      custom_type_label: initialData?.custom_type_label || '',
      title: initialData?.title || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      start_time: initialData?.start_time ? initialData.start_time.slice(0, 5) : '',
      end_time: initialData?.end_time ? initialData.end_time.slice(0, 5) : '',
      location: initialData?.location || '',
      notes: initialData?.notes || '',
      status: initialData?.status || 'scheduled',
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          type: initialData.type,
          custom_type_label: initialData.custom_type_label || '',
          title: initialData.title,
          date: initialData.date,
          start_time: initialData.start_time ? initialData.start_time.slice(0, 5) : '',
          end_time: initialData.end_time ? initialData.end_time.slice(0, 5) : '',
          location: initialData.location || '',
          notes: initialData.notes || '',
          status: initialData.status,
        });
      } else {
        reset({
          type: 'shoot',
          custom_type_label: '',
          title: '',
          date: new Date().toISOString().split('T')[0],
          start_time: '',
          end_time: '',
          location: '',
          notes: '',
          status: 'scheduled',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const sessionTypeOptions: { value: SessionType; label: string }[] = [
    { value: 'shoot', label: 'Shoot' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'pre_production', label: 'Pre-Production' },
    { value: 'event_day', label: 'Event Day' },
    { value: 'custom', label: 'Custom' },
  ];

  const handleFormSubmit = async (values: SessionFormValues) => {
    await onSubmit({
      ...values,
      custom_type_label: values.custom_type_label?.trim() || undefined,
      start_time: values.start_time || undefined,
      end_time: values.end_time || undefined,
      location: values.location?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-surface shadow-sheet flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary-text border border-primary-border">
              <Calendar className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 id="session-modal-title" className="text-base font-semibold text-text-primary">
                {isEditing ? 'Edit Session' : 'Schedule New Session'}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing
                  ? 'Update session agenda and schedule.'
                  : 'Book a production date or client meeting.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Session Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Session Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sessionTypeOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium cursor-pointer transition-all ${
                    selectedType === opt.value
                      ? 'border-primary-border bg-primary-subtle text-primary-text ring-1 ring-primary/30 font-semibold'
                      : 'border-border bg-surface text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                  }`}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('type')}
                    checked={selectedType === opt.value}
                    onChange={() => setValue('type', opt.value, { shouldValidate: true })}
                    className="sr-only"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.type && (
              <p className="mt-1 text-xs text-status-danger-text">{errors.type.message}</p>
            )}
          </div>

          {/* Custom Type Label (if custom) */}
          {selectedType === 'custom' && (
            <div>
              <label
                htmlFor="custom_type_label"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
              >
                Custom Label <span className="text-status-danger-text">*</span>
              </label>
              <div className="relative">
                <Tag
                  className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-text-muted"
                  strokeWidth={1.75}
                />
                <input
                  id="custom_type_label"
                  type="text"
                  placeholder="e.g., Wardrobe Fitting, Aerial Recon"
                  {...register('custom_type_label')}
                  className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              {errors.custom_type_label && (
                <p className="mt-1 text-xs text-status-danger-text">
                  {errors.custom_type_label.message}
                </p>
              )}
            </div>
          )}

          {/* Session Title */}
          <div>
            <label
              htmlFor="session-title"
              className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
            >
              Session Title <span className="text-status-danger-text">*</span>
            </label>
            <input
              id="session-title"
              type="text"
              placeholder="e.g., Morning Outdoor Shoot, Main Ceremony"
              {...register('title')}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-status-danger-text">{errors.title.message}</p>
            )}
          </div>

          {/* Date and Times Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Date */}
            <div>
              <label
                htmlFor="session-date"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
              >
                Date <span className="text-status-danger-text">*</span>
              </label>
              <div className="relative">
                <input
                  id="session-date"
                  type="date"
                  {...register('date')}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-xs text-status-danger-text">{errors.date.message}</p>
              )}
            </div>

            {/* Start Time */}
            <div>
              <label
                htmlFor="session-start-time"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
              >
                Start Time
              </label>
              <input
                id="session-start-time"
                type="time"
                {...register('start_time')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* End Time */}
            <div>
              <label
                htmlFor="session-end-time"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
              >
                End Time
              </label>
              <input
                id="session-end-time"
                type="time"
                {...register('end_time')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="session-location"
              className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
            >
              Location / Venue
            </label>
            <div className="relative">
              <MapPin
                className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-text-muted"
                strokeWidth={1.75}
              />
              <input
                id="session-location"
                type="text"
                placeholder="e.g., Grand Ballroom, Studio A, Pine Forest"
                {...register('location')}
                className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            {errors.location && (
              <p className="mt-1 text-xs text-status-danger-text">{errors.location.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="session-notes"
              className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
            >
              Notes & Call Details
            </label>
            <textarea
              id="session-notes"
              rows={2}
              placeholder="Gear checklist, contact on site, special instructions..."
              {...register('notes')}
              className="w-full rounded-lg border border-border bg-surface p-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Status (if editing) */}
          {isEditing && (
            <div>
              <label
                htmlFor="session-status"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
              >
                Status
              </label>
              <select
                id="session-status"
                {...register('status')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="session-submit-btn"
              disabled={isSubmitting}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Schedule Session'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
