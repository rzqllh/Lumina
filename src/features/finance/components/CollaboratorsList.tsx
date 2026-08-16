import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { useWorkspaceCollaborators } from '../hooks';
import {
  useCreateCollaborator,
  useUpdateCollaborator,
  useDeleteCollaborator,
} from '../hooks/useFinanceMutations';
import { CollaboratorFormModal } from './CollaboratorFormModal';
import { EmptyState } from '@/components/ui/empty-state';
import type { Collaborator } from '../types';
import type { CollaboratorFormValues } from '../schemas/financeSchemas';

interface CollaboratorsListProps {
  workspaceId: string;
}

export const CollaboratorsList: React.FC<CollaboratorsListProps> = ({ workspaceId }) => {
  const { data: collaborators = [], isLoading, error } = useWorkspaceCollaborators(workspaceId);
  const createMutation = useCreateCollaborator(workspaceId);
  const updateMutation = useUpdateCollaborator(workspaceId);
  const deleteMutation = useDeleteCollaborator(workspaceId);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredCollaborators = collaborators.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      (c.specialty && c.specialty.toLowerCase().includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.phone && c.phone.toLowerCase().includes(query))
    );
  });

  const handleOpenCreate = () => {
    setSelectedCollaborator(null);
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (collab: Collaborator) => {
    setSelectedCollaborator(collab);
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (values: CollaboratorFormValues) => {
    setActionError(null);
    try {
      if (selectedCollaborator) {
        await updateMutation.mutateAsync({
          collaboratorId: selectedCollaborator.id,
          input: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to save collaborator');
    }
  };

  const handleDelete = async (collab: Collaborator) => {
    if (!window.confirm(`Are you sure you want to remove "${collab.name}" from your catalog?`)) {
      return;
    }
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(collab.id);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete collaborator');
    }
  };

  return (
    <div data-testid="collaborators-page-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary leading-tight">
            Crew & Collaborators
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage your rolodex of second shooters, editors, drone operators, and crew.
          </p>
        </div>
        <button
          type="button"
          data-testid="add-collaborator-btn"
          onClick={handleOpenCreate}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-subtle hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          <span>Add Collaborator</span>
        </button>
      </div>

      {/* Action Error Alert */}
      {actionError && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-status-danger-border bg-status-danger-subtle p-3 text-xs text-status-danger-text"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <p className="font-medium">{actionError}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-[11px] font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none"
          strokeWidth={1.75}
        />
        <input
          type="text"
          data-testid="collaborator-search-input"
          placeholder="Search by name, skill, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border hover:border-border-interactive focus:border-primary bg-surface pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors shadow-xs"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div data-testid="collaborators-loading" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-border bg-surface-muted/60"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          role="alert"
          data-testid="collaborators-error"
          className="flex flex-col items-center justify-center rounded-xl border border-status-danger-border bg-surface p-8 text-center shadow-subtle"
        >
          <AlertCircle className="h-8 w-8 text-status-danger-text mb-2" strokeWidth={1.75} />
          <h3 className="text-base font-semibold text-text-primary">
            Failed to load collaborators
          </h3>
          <p className="mt-1 text-xs text-text-secondary max-w-sm">
            {error instanceof Error ? error.message : 'An unexpected error occurred.'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredCollaborators.length === 0 && (
        <EmptyState
          icon={Users}
          title={searchQuery ? 'No matching collaborators' : 'No collaborators added yet'}
          description={
            searchQuery
              ? `No crew members found matching "${searchQuery}".`
              : 'Add your regular assistants, second shooters, and freelance editors to quickly assign them to projects.'
          }
          variant="page"
          testId="collaborators-empty-state"
          action={
            !searchQuery ? (
              <button
                type="button"
                data-testid="empty-add-collaborator-btn"
                onClick={handleOpenCreate}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-subtle hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
                <span>Add Your First Crew Member</span>
              </button>
            ) : undefined
          }
        />
      )}

      {/* Collaborator Grid / List */}
      {!isLoading && !error && filteredCollaborators.length > 0 && (
        <div data-testid="collaborators-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCollaborators.map((collab) => (
            <div
              key={collab.id}
              data-testid={`collaborator-card-${collab.id}`}
              className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-xs transition-shadow hover:shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary-text border border-primary-border">
                      <Users className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-primary">{collab.name}</h3>
                      {collab.specialty && (
                        <div className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-secondary border border-border-subtle">
                          <Briefcase className="h-3 w-3" />
                          <span>{collab.specialty}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      data-testid={`edit-collaborator-btn-${collab.id}`}
                      onClick={() => handleOpenEdit(collab)}
                      aria-label={`Edit ${collab.name}`}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      data-testid={`delete-collaborator-btn-${collab.id}`}
                      onClick={() => handleDelete(collab)}
                      aria-label={`Delete ${collab.name}`}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-muted hover:bg-status-danger/10 hover:text-status-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-4 space-y-1.5 text-xs text-text-secondary">
                  {collab.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-text-muted shrink-0" />
                      <a
                        href={`tel:${collab.phone}`}
                        className="hover:text-primary transition-colors"
                      >
                        {collab.phone}
                      </a>
                    </div>
                  )}
                  {collab.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-text-muted shrink-0" />
                      <a
                        href={`mailto:${collab.email}`}
                        className="hover:text-primary transition-colors truncate"
                      >
                        {collab.email}
                      </a>
                    </div>
                  )}
                </div>

                {collab.notes && (
                  <p className="mt-3 text-xs text-text-muted line-clamp-2 bg-surface-muted/50 rounded-lg p-2 border border-border-subtle">
                    {collab.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <CollaboratorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedCollaborator}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
