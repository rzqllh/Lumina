import React from 'react';
import { useNavigate } from 'react-router';
import { Mail, Phone, Users } from 'lucide-react';
import type { ClientListItem } from '../types/clientTypes';
import { ClientTypeBadge } from './ClientTypeBadge';

interface ClientCardProps {
  client: ClientListItem;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  const navigate = useNavigate();
  const contactCount = client.contacts?.length ?? 0;

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid={`client-card-${client.id}`}
      onClick={() => navigate(`/clients/${client.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/clients/${client.id}`);
        }
      }}
      className="group flex flex-col justify-between rounded-[var(--radius-card)] border border-border bg-surface p-4 transition-colors duration-[var(--transition-normal)] hover:border-border-interactive hover:bg-surface-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
    >
      <div className="space-y-2.5">
        {/* Header: Name & Type */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-semibold text-text-primary transition-colors group-hover:text-primary truncate">
              {client.display_name}
            </h3>
            {client.is_archived && (
              <span className="mt-1 inline-flex self-start items-center rounded-[var(--radius-badge)] bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
                Archived
              </span>
            )}
          </div>
          <ClientTypeBadge type={client.client_type} customLabel={client.custom_type_label} />
        </div>

        {/* Contact snippets */}
        <div className="flex flex-col gap-1 text-xs text-text-secondary">
          {client.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <span className="truncate font-medium text-text-primary">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <span className="font-medium">{client.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer — spacing-based separation, no border */}
      <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
        <div className="flex items-center gap-1.5 font-medium">
          <Users className="h-3.5 w-3.5 text-text-muted" />
          <span>
            {contactCount === 0
              ? 'No contacts'
              : `${contactCount} contact${contactCount > 1 ? 's' : ''}`}
          </span>
        </div>
        <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          View →
        </span>
      </div>
    </div>
  );
};
