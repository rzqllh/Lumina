import { useParams } from 'react-router';
import { usePublicProjectStatus } from '@/features/files/hooks/useFiles';
import { StatusPortalTimeline } from '@/features/files/components/StatusPortalTimeline';
import { formatDate } from '@/lib/utils';
import {
  Sparkles,
  Camera,
  Calendar,
  Clock,
  MapPin,
  FileBox,
  HardDrive,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Lock,
} from 'lucide-react';

export function PublicProjectStatusRoute() {
  const { token } = useParams<{ token: string }>();
  const { data: portalData, isLoading, error } = usePublicProjectStatus(token);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading project status portal...
        </div>
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full rounded-2xl border border-border bg-surface p-8 text-center shadow-xl space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary">
              Status Link Expired or Revoked
            </h1>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              This client status portal link is either invalid, has expired, or has been revoked by
              the studio. Please contact your photographer/videographer for an updated link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { project, client, stages, sessions, deliverables, general_files } = portalData;

  return (
    <div className="min-h-screen bg-background text-text-primary px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase">
              <Sparkles className="h-4 w-4" />
              <span>Lumina Client Status Portal</span>
            </div>
            <span className="rounded-full bg-status-success-subtle border border-status-success-border px-3 py-1 text-xs font-bold text-status-success-text uppercase tracking-wide">
              {project.status.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-1 border-t border-border pt-4">
            <h1
              data-testid="public-portal-project-title"
              className="text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl"
            >
              {project.title}
            </h1>
            <p className="text-xs text-text-muted">
              Client: <strong className="text-text-secondary">{client.display_name}</strong>
              {project.project_number && ` • Ref: ${project.project_number}`}
            </p>
          </div>
        </div>

        {/* Workflow Pipeline Timeline */}
        {stages.length > 0 && <StatusPortalTimeline stages={stages} />}

        {/* Production Sessions Card */}
        {sessions.length > 0 && (
          <div
            data-testid="public-portal-sessions"
            className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-5"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                Production Sessions & Call Times
              </h2>
              <span className="text-xs text-text-muted">
                {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sessions.map((ses) => (
                <div
                  key={ses.id}
                  data-testid={`public-session-card-${ses.id}`}
                  className="rounded-2xl border border-border bg-surface-muted/30 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">{ses.title}</span>
                    <span className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-bold text-text-secondary border border-border">
                      {ses.custom_type_label || ses.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-text-muted">
                    <div className="flex items-center gap-1.5 font-semibold text-text-secondary">
                      <Calendar className="h-3.5 w-3.5 text-text-muted" />
                      <span>{formatDate(ses.date)}</span>
                    </div>

                    {(ses.start_time || ses.end_time) && (
                      <div className="flex items-center gap-1.5 font-medium text-primary">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {ses.start_time?.slice(0, 5)}
                          {ses.end_time ? ` - ${ses.end_time.slice(0, 5)}` : ''}
                        </span>
                      </div>
                    )}

                    {ses.location && (
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{ses.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deliverables & Media Galleries */}
        <div
          data-testid="public-portal-deliverables"
          className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-5"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <FileBox className="h-4 w-4 text-primary" />
              Promised Deliverables & Media Downloads
            </h2>
            <span className="text-xs text-text-muted">
              {deliverables.length} {deliverables.length === 1 ? 'deliverable' : 'deliverables'}
            </span>
          </div>

          {deliverables.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">
              No deliverables configured yet.
            </p>
          ) : (
            <div className="space-y-3">
              {deliverables.map((del) => (
                <div
                  key={del.id}
                  data-testid={`public-deliverable-item-${del.id}`}
                  className="rounded-2xl border border-border bg-surface p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-text-primary">{del.label}</h3>
                        {del.type_label && (
                          <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold text-text-muted">
                            {del.type_label}
                          </span>
                        )}
                      </div>
                      {del.deadline && (
                        <p className="text-[11px] text-text-muted mt-0.5">
                          Target Delivery: {formatDate(del.deadline)}
                        </p>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize self-start sm:self-auto ${
                        del.status === 'approved'
                          ? 'bg-status-success-subtle text-status-success-text border border-status-success-border'
                          : del.status === 'delivered'
                            ? 'bg-status-info-subtle text-status-info-text border border-status-info-border'
                            : 'bg-surface-muted text-text-secondary border border-border'
                      }`}
                    >
                      {del.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                      {del.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Attached Media Links */}
                  {del.files && del.files.length > 0 && (
                    <div className="border-t border-border/80 pt-3 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-text-muted block">
                        Media Downloads & Galleries:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {del.files.map((file) => (
                          <a
                            key={file.id}
                            href={file.url_or_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid={`public-file-download-${file.id}`}
                            className="flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs font-bold text-primary hover:bg-primary/10 transition-colors shadow-2xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <HardDrive className="h-4 w-4 shrink-0 text-primary" />
                              <span className="truncate">{file.display_name}</span>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* General Project Media Files */}
          {general_files && general_files.length > 0 && (
            <div className="border-t border-border pt-4 space-y-3">
              <span className="text-xs font-bold text-text-primary block">
                Additional Project Files & Documents:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {general_files.map((file) => (
                  <a
                    key={file.id}
                    href={file.url_or_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface-muted/40 p-3 text-xs font-semibold text-text-primary hover:bg-surface-muted transition-colors shadow-2xs"
                  >
                    <span className="truncate">{file.display_name}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
