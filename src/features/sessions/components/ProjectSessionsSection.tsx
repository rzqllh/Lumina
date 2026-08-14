import React, { useState } from 'react';
import { Calendar, Plus, Clock, AlertCircle } from 'lucide-react';
import { useProjectSessions } from '../hooks/useSessions';
import {
  useCreateSession,
  useUpdateSession,
  useUpdateSessionStatus,
  useDeleteSession,
} from '../hooks/useSessionMutations';
import { SessionCard } from './SessionCard';
import { SessionFormModal } from './SessionFormModal';
import type { Session, SessionStatus } from '../types';
import type { SessionFormValues } from '../schemas/sessionSchemas';

interface ProjectSessionsSectionProps {
  workspaceId: string;
  projectId: string;
  isForceClosed?: boolean;
}

export const ProjectSessionsSection: React.FC<ProjectSessionsSectionProps> = ({
  workspaceId,
  projectId,
  isForceClosed = false,
}) => {
  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
  } = useProjectSessions(workspaceId, projectId);

  const createMutation = useCreateSession(workspaceId, projectId);
  const updateMutation = useUpdateSession(workspaceId, projectId);
  const updateStatusMutation = useUpdateSessionStatus(workspaceId, projectId);
  const deleteMutation = useDeleteSession(workspaceId, projectId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleOpenCreateModal = () => {
    setActionError(null);
    setEditingSession(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (session: Session) => {
    setActionError(null);
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSession(null);
  };

  const handleFormSubmit = async (values: SessionFormValues) => {
    setActionError(null);
    try {
      if (editingSession) {
        await updateMutation.mutateAsync({
          sessionId: editingSession.id,
          input: {
            type: values.type,
            custom_type_label: values.custom_type_label,
            title: values.title,
            date: values.date,
            start_time: values.start_time || null,
            end_time: values.end_time || null,
            location: values.location || null,
            notes: values.notes || null,
            status: values.status,
          },
        });
      } else {
        await createMutation.mutateAsync({
          type: values.type,
          custom_type_label: values.custom_type_label,
          title: values.title,
          date: values.date,
          start_time: values.start_time || null,
          end_time: values.end_time || null,
          location: values.location || null,
          notes: values.notes || null,
          status: values.status,
        });
      }
      handleCloseModal();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to save session');
    }
  };

  const handleStatusChange = async (sessionId: string, newStatus: SessionStatus) => {
    setActionError(null);
    try {
      await updateStatusMutation.mutateAsync({ sessionId, status: newStatus });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to update session status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(sessionToDelete);
      setSessionToDelete(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  return (
    <div data-testid="project-sessions-section" className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary">Production Sessions</h3>
              <span
                data-testid="sessions-count-badge"
                className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-text-secondary border border-border-subtle"
              >
                {sessions.length}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Scheduled shoots, client meetings, and milestone dates
            </p>
          </div>
        </div>

        {!isForceClosed && (
          <button
            type="button"
            data-testid="add-session-btn"
            onClick={handleOpenCreateModal}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-98"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Session</span>
          </button>
        )}
      </div>

      {/* Global Error Notice */}
      {actionError && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-status-danger/25 bg-status-danger/8 p-3 text-xs text-status-danger"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="font-medium">{actionError}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-[11px] font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div data-testid="sessions-loading" className="space-y-3">
          <div className="h-20 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
          <div className="h-20 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
        </div>
      )}

      {/* Query Error */}
      {error && !isLoading && (
        <div
          role="alert"
          data-testid="sessions-error"
          className="flex flex-col items-center justify-center rounded-xl border border-status-danger/25 bg-surface p-6 text-center"
        >
          <AlertCircle className="h-6 w-6 text-status-danger mb-1" />
          <h4 className="text-xs font-bold text-text-primary">Failed to load sessions</h4>
          <p className="mt-1 text-[11px] text-text-secondary">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && sessions.length === 0 && (
        <div
          data-testid="sessions-empty-state"
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/30 p-8 text-center"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border text-text-muted shadow-2xs mb-2">
            <Calendar className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-text-primary">No sessions scheduled yet</h4>
          <p className="mt-1 max-w-xs text-[11px] text-text-muted">
            Add shoot days, client meetings, or event day call times to coordinate production dates.
          </p>
          {!isForceClosed && (
            <button
              type="button"
              data-testid="empty-add-session-btn"
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary shadow-2xs hover:bg-surface-muted transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Schedule First Session</span>
            </button>
          )}
        </div>
      )}

      {/* Sessions List */}
      {!isLoading && !error && sessions.length > 0 && (
        <div data-testid="sessions-list" className="space-y-2.5">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isForceClosed={isForceClosed}
              onEdit={handleOpenEditModal}
              onDelete={(id) => setSessionToDelete(id)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Session Form Modal */}
      <SessionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={editingSession}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      {sessionToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-session-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-4">
            <h3 id="delete-session-title" className="text-sm font-bold text-text-primary">
              Delete Session?
            </h3>
            <p className="text-xs text-text-secondary">
              Are you sure you want to remove this session? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="cursor-pointer rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-delete-session-btn"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="cursor-pointer rounded-xl bg-status-danger px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
