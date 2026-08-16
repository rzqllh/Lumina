import React, { useState } from 'react';
import { useProjectBrief, useBriefSubmissions } from '../hooks/useBriefs';
import {
  useCreateBriefSection,
  useUpdateBriefSection,
  useDeleteBriefSection,
  useCreateBriefField,
  useUpdateBriefField,
  useDeleteBriefField,
  useApplyBriefTemplate,
  useSaveBriefAsTemplate,
} from '../hooks/useBriefMutations';
import { BriefSectionCard } from './BriefSectionCard';
import { BriefSectionFormModal } from './BriefSectionFormModal';
import { BriefFieldFormModal } from './BriefFieldFormModal';
import { ApplyBriefTemplateModal } from './ApplyBriefTemplateModal';
import { SaveAsBriefTemplateModal } from './SaveAsBriefTemplateModal';
import { ShareBriefLinkModal } from './ShareBriefLinkModal';
import { BriefSubmissionReviewModal } from './BriefSubmissionReviewModal';
import { EmptyState } from '@/components/ui/empty-state';
import { ContextHelp } from '@/components/ui/context-help';
import type { BriefSection, BriefField } from '../types';
import type {
  BriefSectionFormValues,
  BriefFieldFormValues,
  BriefTemplateFormValues,
} from '../schemas/briefSchemas';
import { FileText, Plus, Layers, BookmarkPlus, Share2, Inbox, Sparkles } from 'lucide-react';

interface ProjectBriefSectionProps {
  workspaceId: string;
  projectId: string;
}

export const ProjectBriefSection: React.FC<ProjectBriefSectionProps> = ({
  workspaceId,
  projectId,
}) => {
  const { data: brief, isLoading } = useProjectBrief(workspaceId, projectId);
  const { data: submissions = [] } = useBriefSubmissions(brief?.id);

  const pendingSubmissions = submissions.filter((s) => s.review_status === 'pending');

  // Mutations
  const createSectionMutation = useCreateBriefSection(workspaceId, projectId);
  const updateSectionMutation = useUpdateBriefSection(workspaceId, projectId);
  const deleteSectionMutation = useDeleteBriefSection(workspaceId, projectId);
  const createFieldMutation = useCreateBriefField(workspaceId, projectId);
  const updateFieldMutation = useUpdateBriefField(workspaceId, projectId);
  const deleteFieldMutation = useDeleteBriefField(workspaceId, projectId);
  const applyTemplateMutation = useApplyBriefTemplate(workspaceId, projectId);
  const saveTemplateMutation = useSaveBriefAsTemplate(workspaceId);

  // Modals state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<BriefSection | null>(null);

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [targetSectionForField, setTargetSectionForField] = useState<BriefSection | null>(null);
  const [fieldToEdit, setFieldToEdit] = useState<BriefField | null>(null);

  const [isApplyTemplateModalOpen, setIsApplyTemplateModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-xs text-text-muted">
        Loading project brief...
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-xs text-text-muted">
        Brief not initialized.
      </div>
    );
  }

  const sections = brief.sections || [];
  const totalQuestions = sections.reduce((acc, s) => acc + (s.fields?.length || 0), 0);

  // Handlers
  async function handleSectionSubmit(values: BriefSectionFormValues) {
    if (sectionToEdit) {
      await updateSectionMutation.mutateAsync({
        sectionId: sectionToEdit.id,
        input: values,
      });
    } else {
      await createSectionMutation.mutateAsync({
        brief_id: brief!.id,
        label: values.label,
        instruction_text: values.instruction_text,
        position: sections.length,
      });
    }
    setIsSectionModalOpen(false);
    setSectionToEdit(null);
  }

  async function handleFieldSubmit(values: BriefFieldFormValues) {
    if (fieldToEdit) {
      await updateFieldMutation.mutateAsync({
        fieldId: fieldToEdit.id,
        input: values,
      });
    } else if (targetSectionForField) {
      await createFieldMutation.mutateAsync({
        section_id: targetSectionForField.id,
        field_type: values.field_type,
        label: values.label,
        helper_text: values.helper_text,
        is_required: values.is_required,
        visibility: values.visibility,
        value: values.value,
        position: targetSectionForField.fields?.length || 0,
      });
    }
    setIsFieldModalOpen(false);
    setFieldToEdit(null);
    setTargetSectionForField(null);
  }

  async function handleApplyTemplate(templateId: string) {
    await applyTemplateMutation.mutateAsync({
      briefId: brief!.id,
      templateId,
    });
    setIsApplyTemplateModalOpen(false);
  }

  async function handleSaveAsTemplate(values: BriefTemplateFormValues) {
    await saveTemplateMutation.mutateAsync({
      briefId: brief!.id,
      templateName: values.name,
      description: values.description,
    });
    setIsSaveTemplateModalOpen(false);
  }

  return (
    <div data-testid="project-brief-section" className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border bg-surface p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle text-primary-text border border-primary-border">
            <FileText className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-text-primary">
                Project Creative Brief & Client Intake
              </h2>
              <ContextHelp
                title="Brief & Client Intake"
                description="Each project has one canonical brief. When clients submit responses via the intake link, you review changes side-by-side. Accepted answers update the canonical brief while raw submissions are preserved."
                guideAnchor="#project-brief"
                testId="brief-context-help"
              />
              {pendingSubmissions.length > 0 && (
                <button
                  type="button"
                  data-testid="pending-submissions-badge"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="flex items-center gap-1 rounded-md bg-status-warning-subtle border border-status-warning-border px-2 py-0.5 text-xs font-semibold text-status-warning-text animate-pulse cursor-pointer shadow-2xs"
                >
                  <Inbox className="h-3 w-3" strokeWidth={1.75} />
                  {pendingSubmissions.length} new client{' '}
                  {pendingSubmissions.length === 1 ? 'submission' : 'submissions'}
                </button>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-0.5 tabular-nums">
              {sections.length} {sections.length === 1 ? 'section' : 'sections'} • {totalQuestions}{' '}
              {totalQuestions === 1 ? 'question' : 'questions'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pendingSubmissions.length > 0 && (
            <button
              type="button"
              data-testid="review-submissions-btn"
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-status-warning-subtle border border-status-warning-border px-3 py-1.5 text-xs font-semibold text-status-warning-text hover:bg-status-warning-subtle/80 transition-colors cursor-pointer shadow-subtle"
            >
              <Inbox className="h-3.5 w-3.5" strokeWidth={1.75} />
              Review Submissions ({pendingSubmissions.length})
            </button>
          )}

          <button
            type="button"
            data-testid="share-intake-link-btn"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer shadow-subtle"
          >
            <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Share Intake Link
          </button>

          <button
            type="button"
            data-testid="apply-brief-template-btn"
            onClick={() => setIsApplyTemplateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer shadow-subtle"
          >
            <Layers className="h-3.5 w-3.5" strokeWidth={1.75} />
            Apply Template
          </button>

          <button
            type="button"
            data-testid="save-as-template-btn"
            disabled={sections.length === 0}
            onClick={() => setIsSaveTemplateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer shadow-subtle disabled:opacity-40"
          >
            <BookmarkPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Save as Template
          </button>

          <button
            type="button"
            data-testid="add-brief-section-btn"
            onClick={() => {
              setSectionToEdit(null);
              setIsSectionModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors cursor-pointer shadow-subtle"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Add Section
          </button>
        </div>
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Creative Brief is Empty"
          description="Organize moodboard references, run of show timelines, and client questionnaires into structured sections."
          action={
            <button
              type="button"
              onClick={() => {
                setSectionToEdit(null);
                setIsSectionModalOpen(true);
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors shadow-subtle"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Add First Section</span>
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <BriefSectionCard
              key={section.id}
              section={section}
              onAddField={(sec) => {
                setTargetSectionForField(sec);
                setFieldToEdit(null);
                setIsFieldModalOpen(true);
              }}
              onEditSection={(sec) => {
                setSectionToEdit(sec);
                setIsSectionModalOpen(true);
              }}
              onDeleteSection={(secId) => deleteSectionMutation.mutateAsync(secId)}
              onEditField={(field, sec) => {
                setTargetSectionForField(sec);
                setFieldToEdit(field);
                setIsFieldModalOpen(true);
              }}
              onDeleteField={(fieldId) => deleteFieldMutation.mutateAsync(fieldId)}
            />
          ))}
        </div>
      )}

      {/* Section Form Modal */}
      <BriefSectionFormModal
        isOpen={isSectionModalOpen}
        onClose={() => {
          setIsSectionModalOpen(false);
          setSectionToEdit(null);
        }}
        onSubmit={handleSectionSubmit}
        sectionToEdit={sectionToEdit}
        isPending={createSectionMutation.isPending || updateSectionMutation.isPending}
      />

      {/* Field Form Modal */}
      <BriefFieldFormModal
        isOpen={isFieldModalOpen}
        onClose={() => {
          setIsFieldModalOpen(false);
          setFieldToEdit(null);
          setTargetSectionForField(null);
        }}
        onSubmit={handleFieldSubmit}
        fieldToEdit={fieldToEdit}
        sectionTitle={targetSectionForField?.label}
        isPending={createFieldMutation.isPending || updateFieldMutation.isPending}
      />

      {/* Apply Template Modal */}
      <ApplyBriefTemplateModal
        isOpen={isApplyTemplateModalOpen}
        onClose={() => setIsApplyTemplateModalOpen(false)}
        workspaceId={workspaceId}
        onApplyTemplate={handleApplyTemplate}
        isPending={applyTemplateMutation.isPending}
      />

      {/* Save As Template Modal */}
      <SaveAsBriefTemplateModal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setIsSaveTemplateModalOpen(false)}
        onSubmit={handleSaveAsTemplate}
        isPending={saveTemplateMutation.isPending}
      />

      {/* Share Link Modal */}
      <ShareBriefLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        projectId={projectId}
      />

      {/* Submission Review Modal */}
      <BriefSubmissionReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        workspaceId={workspaceId}
        projectId={projectId}
        brief={brief}
        submissions={submissions}
      />
    </div>
  );
};
