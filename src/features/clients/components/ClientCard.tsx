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
      className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:border-primary/40 hover:bg-surface-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
    >
      <div>
        {/* Header: Title & Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-text-primary transition-colors group-hover:text-primary">
              {client.display_name}
            </h3>
            {client.is_archived && (
              <span className="mt-1 inline-flex items-center rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 border border-zinc-200">
                Archived
              </span>
            )}
          </div>
          <ClientTypeBadge type={client.client_type} customLabel={client.custom_type_label} />
        </div>

        {/* Contact Info Snippets */}
        <div className="mt-3 flex flex-col gap-1.5 text-xs text-text-secondary">
          {client.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <span>{client.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Contacts Count */}
      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3 text-xs text-text-muted">
        <div className="flex items-center gap-1.5 font-medium">
          <Users className="h-3.5 w-3.5 text-text-muted" />
          <span>
            {contactCount === 0
              ? 'No contacts'
              : `${contactCount} contact${contactCount > 1 ? 's' : ''}`}
          </span>
        </div>
        <span className="text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
          View details →
        </span>
      </div>
    </div>
  );
};
