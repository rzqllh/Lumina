import React from 'react';
import type { FileReference } from '../types';
import { ExternalLink, Trash2, Lock, Eye, FolderSymlink, HardDrive, Globe } from 'lucide-react';

interface FileReferenceCardProps {
  file: FileReference;
  deliverableLabel?: string | null;
  onDelete: (fileId: string) => void;
  isForceClosed?: boolean;
}

export const FileReferenceCard: React.FC<FileReferenceCardProps> = ({
  file,
  deliverableLabel,
  onDelete,
  isForceClosed = false,
}) => {
  function getProviderIcon() {
    switch (file.provider) {
      case 'google_drive':
        return <HardDrive className="h-4 w-4 text-status-success-text" strokeWidth={1.75} />;
      case 'app_storage':
        return <FolderSymlink className="h-4 w-4 text-primary-text" strokeWidth={1.75} />;
      default:
        return <Globe className="h-4 w-4 text-status-info-text" strokeWidth={1.75} />;
    }
  }

  function getProviderLabel() {
    switch (file.provider) {
      case 'google_drive':
        return 'Google Drive';
      case 'app_storage':
        return 'Lumina Storage';
      default:
        return 'External Link';
    }
  }

  return (
    <div
      data-testid={`file-reference-card-${file.id}`}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-border-subtle shadow-2xs"
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted border border-border">
          {getProviderIcon()}
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-text-primary truncate">
              {file.display_name}
            </h4>

            <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-xs font-medium text-text-secondary border border-border-subtle">
              {getProviderLabel()}
            </span>

            {file.is_client_visible ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-status-success-subtle px-1.5 py-0.5 text-xs font-semibold text-status-success-text border border-status-success-border">
                <Eye className="h-3 w-3" strokeWidth={1.75} />
                Client Visible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-status-warning-subtle px-1.5 py-0.5 text-xs font-semibold text-status-warning-text border border-status-warning-border">
                <Lock className="h-3 w-3" strokeWidth={1.75} />
                Studio Only
              </span>
            )}
          </div>

          {deliverableLabel && (
            <p className="text-xs font-medium text-text-muted truncate">
              Attached to deliverable:{' '}
              <strong className="text-text-secondary font-semibold">{deliverableLabel}</strong>
            </p>
          )}

          {file.notes && (
            <p className="text-xs text-text-muted leading-relaxed truncate">{file.notes}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <a
          href={file.url_or_path}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`open-file-link-${file.id}`}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-primary-text hover:bg-primary-subtle transition-colors cursor-pointer shadow-subtle"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Open Link</span>
        </a>

        {!isForceClosed && (
          <button
            type="button"
            data-testid={`delete-file-btn-${file.id}`}
            onClick={() => onDelete(file.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-status-danger-border bg-surface text-status-danger-text hover:bg-status-danger-subtle transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>
    </div>
  );
};
