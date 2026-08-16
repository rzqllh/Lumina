import React from 'react';
import { Mail, Phone, Edit2, Trash2, Star } from 'lucide-react';
import type { ClientContact } from '../types/clientTypes';

interface ContactCardProps {
  contact: ClientContact;
  onEdit: (contact: ClientContact) => void;
  onDelete: (contact: ClientContact) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete }) => {
  return (
    <div
      data-testid={`contact-card-${contact.id}`}
      className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4 shadow-subtle transition-all sm:flex-row sm:items-center"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-text-primary">{contact.name}</span>
          {contact.is_primary && (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary-subtle px-2 py-0.5 text-xs font-semibold text-primary-text border border-primary-border">
              <Star className="h-2.5 w-2.5 fill-primary-text" /> Primary
            </span>
          )}
          {contact.role_label && (
            <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-secondary border border-border-subtle">
              {contact.role_label}
            </span>
          )}
        </div>

        {/* Contact Methods */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-1.5 hover:text-primary-text transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
              <span>{contact.email}</span>
            </a>
          )}
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-1.5 hover:text-primary-text transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
              <span>{contact.phone}</span>
            </a>
          )}
        </div>

        {contact.notes && <p className="mt-1 text-xs text-text-muted italic">{contact.notes}</p>}
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex items-center justify-end gap-1.5 sm:mt-0">
        <button
          type="button"
          data-testid={`edit-contact-btn-${contact.id}`}
          onClick={() => onEdit(contact)}
          aria-label={`Edit ${contact.name}`}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          data-testid={`delete-contact-btn-${contact.id}`}
          onClick={() => onDelete(contact)}
          aria-label={`Delete ${contact.name}`}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-status-danger-subtle hover:border-status-danger-border hover:text-status-danger-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
};
