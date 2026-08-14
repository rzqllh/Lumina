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
      <div className="rounded-2xl border border-border bg-surface p-8 text-center text-xs text-text-muted">
        Loading project brief...
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center text-xs text-text-muted">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-text-primary sm:text-base">
                Project Creative Brief & Client Intake
              </h2>
              {pendingSubmissions.length > 0 && (
                <button
                  type="button"
                  data-testid="pending-submissions-badge"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white animate-pulse cursor-pointer shadow-xs"
                >
                  <Inbox className="h-3 w-3" />
                  {pendingSubmissions.length} new client{' '}
                  {pendingSubmissions.length === 1 ? 'submission' : 'submissions'}
                </button>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
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
              className="flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
            >
              <Inbox className="h-3.5 w-3.5" />
              Review Submissions ({pendingSubmissions.length})
            </button>
          )}

          <button
            type="button"
            data-testid="share-intake-link-btn"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer shadow-2xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share Intake Link
          </button>

          <button
            type="button"
            data-testid="apply-brief-template-btn"
            onClick={() => setIsApplyTemplateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer shadow-2xs"
          >
            <Layers className="h-3.5 w-3.5" />
            Apply Template
          </button>

          <button
            type="button"
            data-testid="save-as-template-btn"
            disabled={sections.length === 0}
            onClick={() => setIsSaveTemplateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer shadow-2xs disabled:opacity-40"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            Save as Template
          </button>

          <button
            type="button"
            data-testid="add-brief-section-btn"
            onClick={() => {
              setSectionToEdit(null);
              setIsSectionModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Section
          </button>
        </div>
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Creative Brief is Empty</h3>
            <p className="text-xs text-text-muted max-w-md mx-auto mt-1">
              Organize moodboard references, run of show timelines, and client questionnaires into
              structured sections.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              data-testid="empty-apply-template-btn"
              onClick={() => setIsApplyTemplateModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-text-primary hover:bg-surface-muted transition-colors cursor-pointer shadow-2xs"
            >
              <Layers className="h-3.5 w-3.5" />
              Apply Brief Template
            </button>
            <button
              type="button"
              data-testid="empty-add-section-btn"
              onClick={() => {
                setSectionToEdit(null);
                setIsSectionModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add First Section
            </button>
          </div>
        </div>
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
              onDeleteField={(fId) => deleteFieldMutation.mutateAsync(fId)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
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

      <ApplyBriefTemplateModal
        isOpen={isApplyTemplateModalOpen}
        onClose={() => setIsApplyTemplateModalOpen(false)}
        workspaceId={workspaceId}
        onApplyTemplate={handleApplyTemplate}
        isPending={applyTemplateMutation.isPending}
      />

      <SaveAsBriefTemplateModal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setIsSaveTemplateModalOpen(false)}
        onSubmit={handleSaveAsTemplate}
        defaultName={`${brief.title || 'Project'} Template`}
        isPending={saveTemplateMutation.isPending}
      />

      <ShareBriefLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        projectId={projectId}
      />

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
