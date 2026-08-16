import React, { useState } from 'react';
import { useProjectFileReferences } from '../hooks/useFiles';
import { useCreateFileReference, useDeleteFileReference } from '../hooks/useFileMutations';
import { useProjectDeliverables } from '@/features/deliverables';
import { FileReferenceCard } from './FileReferenceCard';
import { FileReferenceFormModal } from './FileReferenceFormModal';
import { ShareProjectStatusModal } from './ShareProjectStatusModal';
import { EmptyState } from '@/components/ui/empty-state';
import type { FileReferenceFormValues } from '../schemas/fileSchemas';
import { FolderSymlink, Plus, Share2, HardDrive } from 'lucide-react';

interface ProjectFilesSectionProps {
  workspaceId: string;
  projectId: string;
  isForceClosed?: boolean;
}

export const ProjectFilesSection: React.FC<ProjectFilesSectionProps> = ({
  workspaceId,
  projectId,
  isForceClosed = false,
}) => {
  const { data: files = [], isLoading } = useProjectFileReferences(workspaceId, projectId);
  const { data: deliverables = [] } = useProjectDeliverables(workspaceId, projectId);

  const createFileMutation = useCreateFileReference(workspaceId, projectId);
  const deleteFileMutation = useDeleteFileReference(workspaceId, projectId);

  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-xs text-text-muted">
        Loading project files and media links...
      </div>
    );
  }

  const driveFilesCount = files.filter((f) => f.provider === 'google_drive').length;

  async function handleFileSubmit(values: FileReferenceFormValues) {
    await createFileMutation.mutateAsync({
      workspace_id: workspaceId,
      project_id: projectId,
      deliverable_id: values.deliverable_id || null,
      provider: values.provider,
      display_name: values.display_name,
      url_or_path: values.url_or_path,
      is_client_visible: values.is_client_visible,
      notes: values.notes || null,
    });
    setIsFileModalOpen(false);
  }

  // Map deliverable labels
  const deliverableMap = new Map(deliverables.map((d) => [d.id, d.label]));

  return (
    <div data-testid="project-files-section" className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border bg-surface p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle text-primary-text border border-primary-border">
            <HardDrive className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              External Files, Google Drive & Client Portal
            </h2>
            <p className="text-xs text-text-secondary mt-0.5 tabular-nums">
              {files.length} {files.length === 1 ? 'link attached' : 'links attached'} •{' '}
              {driveFilesCount} Google Drive
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="open-status-portal-modal-btn"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-muted transition-colors cursor-pointer shadow-subtle"
          >
            <Share2 className="h-3.5 w-3.5 text-primary-text" strokeWidth={1.75} />
            Share Client Status Portal
          </button>

          {!isForceClosed && (
            <button
              type="button"
              data-testid="attach-file-link-btn"
              onClick={() => setIsFileModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors cursor-pointer shadow-subtle"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Attach Media Link
            </button>
          )}
        </div>
      </div>

      {/* Files List */}
      {files.length === 0 ? (
        <EmptyState
          icon={FolderSymlink}
          title="No External Links Attached"
          description="Attach Google Drive galleries, Dropbox folders, or Frame.io review links directly to this project or to individual deliverables."
          action={
            !isForceClosed ? (
              <button
                type="button"
                data-testid="empty-attach-file-btn"
                onClick={() => setIsFileModalOpen(true)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Attach First Media Link</span>
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <FileReferenceCard
              key={file.id}
              file={file}
              deliverableLabel={
                file.deliverable_id ? deliverableMap.get(file.deliverable_id) : null
              }
              onDelete={(fId) => deleteFileMutation.mutateAsync(fId)}
              isForceClosed={isForceClosed}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <FileReferenceFormModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onSubmit={handleFileSubmit}
        deliverables={deliverables}
        isPending={createFileMutation.isPending}
      />

      <ShareProjectStatusModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        workspaceId={workspaceId}
        projectId={projectId}
      />
    </div>
  );
};
