import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Edit2,
  Plus,
  Users,
  Mail,
  Phone,
  FolderKanban,
  AlertCircle,
} from 'lucide-react';
import {
  useClient,
  useClientMutations,
  ClientTypeBadge,
  ContactCard,
  ContactFormModal,
  DeleteContactDialog,
  type ClientContact,
  type ContactFormValues,
} from '@/features/clients';
import { EmptyState } from '@/components/ui/empty-state';

export function ClientDetailRoute() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const { data: client, isLoading, error, refetch } = useClient(clientId);
  const { createContact, updateContact, deleteContact } = useClientMutations();

  // Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ClientContact | null>(null);

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<ClientContact | null>(null);

  const handleOpenCreateContact = () => {
    setSelectedContact(null);
    setIsContactModalOpen(true);
  };

  const handleOpenEditContact = (contact: ClientContact) => {
    setSelectedContact(contact);
    setIsContactModalOpen(true);
  };

  const handleOpenDeleteContact = (contact: ClientContact) => {
    setContactToDelete(contact);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveContact = async (values: ContactFormValues) => {
    if (!clientId) return;

    if (selectedContact) {
      await updateContact.mutateAsync({
        clientId,
        contactId: selectedContact.id,
        input: {
          name: values.name,
          role_label: values.role_label || null,
          email: values.email || null,
          phone: values.phone || null,
          notes: values.notes || null,
          is_primary: values.is_primary,
        },
      });
    } else {
      await createContact.mutateAsync({
        client_id: clientId,
        name: values.name,
        role_label: values.role_label || null,
        email: values.email || null,
        phone: values.phone || null,
        notes: values.notes || null,
        is_primary: values.is_primary,
      });
    }
    setIsContactModalOpen(false);
  };

  const handleConfirmDeleteContact = async () => {
    if (!clientId || !contactToDelete) return;
    await deleteContact.mutateAsync({
      clientId,
      contactId: contactToDelete.id,
    });
    setIsDeleteDialogOpen(false);
    setContactToDelete(null);
  };

  if (isLoading) {
    return (
      <div data-testid="client-detail-loading" className="space-y-6">
        <div className="h-28 animate-pulse rounded-xl border border-border bg-surface-muted/60" />
        <div className="h-48 animate-pulse rounded-xl border border-border bg-surface-muted/60" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div
        role="alert"
        data-testid="client-detail-error"
        className="flex flex-col items-center justify-center rounded-xl border border-status-danger-border bg-surface p-8 text-center"
      >
        <AlertCircle className="h-8 w-8 text-status-danger-text mb-2" strokeWidth={1.75} />
        <h3 className="text-base font-semibold text-text-primary">Client not found</h3>
        <p className="mt-1 text-xs text-text-secondary max-w-sm">
          {error?.message || 'The requested client could not be loaded.'}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
          >
            Back to Clients
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors shadow-subtle"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="back-to-clients-btn"
            onClick={() => navigate('/clients')}
            aria-label="Back to clients"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
              {client.display_name}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <ClientTypeBadge type={client.client_type} customLabel={client.custom_type_label} />
              {client.is_archived && (
                <span className="inline-flex items-center rounded-md bg-surface-muted px-1.5 py-0.5 text-xs font-medium text-text-muted border border-border-subtle">
                  Archived
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          data-testid="edit-client-btn"
          onClick={() => navigate(`/clients/${client.id}/edit`)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring self-start sm:self-auto"
        >
          <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Identity & Metadata Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
          Client Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <Mail className="h-4 w-4 text-text-muted shrink-0" strokeWidth={1.75} />
            <span>{client.email || 'No email provided'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <Phone className="h-4 w-4 text-text-muted shrink-0" strokeWidth={1.75} />
            <span>{client.phone || 'No phone provided'}</span>
          </div>
        </div>

        {client.notes && (
          <div className="mt-4 border-t border-border-subtle pt-4 text-xs text-text-secondary">
            <span className="font-semibold text-text-primary block mb-1">Notes:</span>
            <p className="whitespace-pre-wrap leading-relaxed">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Contacts Management Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-text" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-text-primary">
              Person Contacts ({client.contacts.length})
            </h2>
          </div>
          <button
            type="button"
            data-testid="add-contact-btn"
            onClick={handleOpenCreateContact}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Add Contact</span>
          </button>
        </div>

        {client.contacts.length === 0 ? (
          <div data-testid="empty-contacts-state">
            <EmptyState
              icon={Users}
              title="No person contacts yet"
              description="Add contacts like Bride, Groom, or Corporate PIC."
              variant="section"
            />
          </div>
        ) : (
          <div data-testid="contacts-list" className="grid grid-cols-1 gap-3">
            {client.contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={handleOpenEditContact}
                onDelete={handleOpenDeleteContact}
              />
            ))}
          </div>
        )}
      </div>

      {/* Projects Association Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-text-primary">Projects (0)</h2>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 text-center text-xs text-text-muted shadow-subtle">
          No projects linked yet. You will be able to associate this client when creating projects
          in Project Foundation.
        </div>
      </div>

      {/* Modals & Dialogs */}
      <ContactFormModal
        isOpen={isContactModalOpen}
        contact={selectedContact}
        onClose={() => setIsContactModalOpen(false)}
        onSubmit={handleSaveContact}
        isSubmitting={createContact.isPending || updateContact.isPending}
      />

      <DeleteContactDialog
        isOpen={isDeleteDialogOpen}
        contactName={contactToDelete?.name || ''}
        onConfirm={handleConfirmDeleteContact}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setContactToDelete(null);
        }}
        isDeleting={deleteContact.isPending}
      />
    </div>
  );
}
