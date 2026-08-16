import React, { useState } from 'react';
import { useParams } from 'react-router';
import { usePublicBriefIntake } from '@/features/briefs/hooks/useBriefs';
import { useSubmitPublicBrief } from '@/features/briefs/hooks/useBriefMutations';
import { BriefFieldRenderer } from '@/features/briefs/components/BriefFieldRenderer';
import type { BriefField } from '@/features/briefs/types';
import { FileText, CheckCircle2, AlertCircle, Sparkles, Send, Loader2 } from 'lucide-react';

export function PublicBriefIntakeRoute() {
  const { token } = useParams<{ token: string }>();
  const { data: intakeData, isLoading, error } = usePublicBriefIntake(token);
  const submitMutation = useSubmitPublicBrief(token || '');

  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize answers with initial default values
  React.useEffect(() => {
    if (intakeData?.sections) {
      const initial: Record<string, unknown> = {};
      for (const sec of intakeData.sections) {
        for (const f of sec.fields) {
          if (f.value !== null && f.value !== undefined) {
            initial[f.id] = f.value;
          }
        }
      }
      setAnswers((prev) => ({ ...initial, ...prev }));
    }
  }, [intakeData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading project questionnaire...
        </div>
      </div>
    );
  }

  if (error || !intakeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full rounded-2xl border border-border bg-surface p-8 text-center shadow-xl space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary">Invalid or Expired Link</h1>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              This questionnaire link is either invalid, has expired, or has been revoked by the
              studio. Please contact your photographer/videographer for an updated link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div
          data-testid="brief-submission-success"
          className="max-w-md w-full rounded-2xl border border-border bg-surface p-8 text-center shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-status-success-subtle text-status-success-text border border-status-success-border">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">
              Thank You, {intakeData.client_name}!
            </h1>
            <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
              Your questionnaire responses for{' '}
              <strong className="text-text-primary">{intakeData.project_title}</strong> have been
              successfully submitted to the production team.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted/50 p-4 text-xs text-text-muted text-left space-y-1">
            <span className="font-bold text-text-primary block">What happens next?</span>
            <p className="text-[11px] leading-relaxed">
              The studio will review your moodboards and requirements to finalize the production
              schedule and shot list.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="text-xs font-bold text-primary hover:underline cursor-pointer pt-2"
          >
            Edit your responses
          </button>
        </div>
      </div>
    );
  }

  function handleFieldChange(fieldId: string, value: unknown) {
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    if (validationError) setValidationError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    // Validate required fields
    for (const sec of intakeData!.sections) {
      for (const field of sec.fields) {
        const isMustFill = field.is_required || field.visibility === 'client_must_fill';
        const val = answers[field.id];

        if (
          isMustFill &&
          (val === undefined || val === null || (typeof val === 'string' && val.trim() === ''))
        ) {
          setValidationError(`Please answer required question: "${field.label}" in "${sec.label}"`);
          return;
        }
      }
    }

    try {
      await submitMutation.mutateAsync(answers);
      setIsSubmitted(true);
    } catch (err: unknown) {
      setValidationError(
        (err as Error)?.message || 'Failed to submit responses. Please try again.'
      );
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top Branding / Header */}
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase">
              <Sparkles className="h-4 w-4" />
              <span>Lumina Client Portal</span>
            </div>
            <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-text-muted">
              Project Questionnaire
            </span>
          </div>

          <div className="space-y-1 border-t border-border pt-4">
            <h1
              data-testid="public-intake-project-title"
              className="text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl"
            >
              {intakeData.project_title}
            </h1>
            <p className="text-xs text-text-muted">
              Prepared for <strong className="text-text-secondary">{intakeData.client_name}</strong>{' '}
              • {intakeData.brief_title}
            </p>
          </div>
        </div>

        {/* Form Sections */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {validationError && (
            <div
              data-testid="intake-validation-error"
              className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-semibold text-destructive flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {intakeData.sections.map((section) => (
            <div
              key={section.id}
              data-testid={`public-section-${section.id}`}
              className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-5"
            >
              <div className="border-b border-border pb-3">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  {section.label}
                </h2>
                {section.instruction_text && (
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    {section.instruction_text}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {section.fields.map((field) => {
                  const isReadOnly = field.visibility === 'client_can_view';
                  const castField: BriefField = {
                    ...field,
                    section_id: section.id,
                    created_at: '',
                    updated_at: '',
                  };

                  return (
                    <div key={field.id} className="space-y-1">
                      <BriefFieldRenderer
                        field={castField}
                        isReadOnly={isReadOnly}
                        value={answers[field.id]}
                        onChange={(val) => handleFieldChange(field.id, val)}
                        showVisibilityBadge={false}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-xs text-text-muted text-center sm:text-left">
              You can re-open this link and submit updates whenever details change.
            </p>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              data-testid="submit-public-intake-btn"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting Responses...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Questionnaire Responses
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
