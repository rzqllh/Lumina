import React from 'react';
import { useNavigate } from 'react-router';
import { Mail, Phone, Users } from 'lucide-react';
import type { ClientListItem } from '../types/clientTypes';
import { ClientTypeBadge } from './ClientTypeBadge';
import { StatusBadge } from '@/components/ui/status-badge';

/**
 * CLIENT-003 — ClientCard
 * Canonical card using token-aligned styling.
 * Archived badge uses canonical neutral status token.
 * Contact snippets and type badge preserved exactly.
 */

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
      className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        transition: `border-color var(--duration-fast) var(--ease-standard),
                     background-color var(--duration-fast) var(--ease-standard)`,
        borderRadius: 'var(--radius-xl)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-interactive)';
        e.currentTarget.style.backgroundColor = 'var(--color-surface-muted)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-default)';
        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
      }}
    >
      <div className="space-y-2.5">
        {/* Header: Name & Type */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-semibold text-text-primary truncate">
              {client.display_name}
            </h3>
            {client.is_archived && (
              <div className="mt-1">
                <StatusBadge variant="archived" label="Archived" />
              </div>
            )}
          </div>
          <ClientTypeBadge type={client.client_type} customLabel={client.custom_type_label} />
        </div>

        {/* Contact snippets */}
        <div className="flex flex-col gap-1 text-xs text-text-secondary">
          {client.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
              <span className="truncate font-medium text-text-primary">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
              <span className="font-medium">{client.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-text-secondary pt-2.5 border-t border-border-subtle">
        <div className="flex items-center gap-1.5 font-medium">
          <Users className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
          <span>
            {contactCount === 0
              ? 'No contacts'
              : `${contactCount} contact${contactCount > 1 ? 's' : ''}`}
          </span>
        </div>
        <span className="text-xs font-medium text-primary-text">View →</span>
      </div>
    </div>
  );
};
