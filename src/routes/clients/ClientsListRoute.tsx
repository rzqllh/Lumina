import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { useClients, ClientCard } from '@/features/clients';
import { PageHeader } from '@/components/ui/page-header';
import { FilterSegmentedControl } from '@/components/ui/filter-segmented-control';
import { EmptyState } from '@/components/ui/empty-state';

/**
 * CLIENT-001 — Page Header: title + description + New Client action
 * CLIENT-002 — Search + Filter: canonical FilterSegmentedControl
 * CLIENT-003 — ClientCard: updated in ClientCard.tsx
 * CLIENT-004 — Loading / Empty / Error: canonical EmptyState
 */
export function ClientsListRoute() {
  const navigate = useNavigate();
  const [includeArchived, setIncludeArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: clients = [], isLoading, error, refetch } = useClients(includeArchived);

  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return clients;

    return clients.filter((client) => {
      const matchName = client.display_name.toLowerCase().includes(query);
      const matchEmail = client.email ? client.email.toLowerCase().includes(query) : false;
      const matchPhone = client.phone ? client.phone.toLowerCase().includes(query) : false;
      const matchType = client.client_type.toLowerCase().includes(query);
      const matchCustom = client.custom_type_label
        ? client.custom_type_label.toLowerCase().includes(query)
        : false;

      return matchName || matchEmail || matchPhone || matchType || matchCustom;
    });
  }, [clients, searchQuery]);

  const filterOptions = [
    { id: 'active', label: 'Active' },
    { id: 'all', label: 'All & Archived' },
  ];

  return (
    <div className="space-y-5">
      {/* CLIENT-001 — Page Header */}
      <PageHeader
        title="Clients"
        description="Customer directory and contact management."
        actions={
          <button
            type="button"
            data-testid="add-client-btn"
            onClick={() => navigate('/clients/new')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground border border-transparent hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              height: 'var(--control-height-mobile)',
              borderRadius: 'var(--radius-md)',
              transition: `background-color var(--duration-fast)`,
            }}
          >
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            <span>New Client</span>
          </button>
        }
      />

      {/* CLIENT-002 — Filter Bar + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <input
            type="text"
            aria-label="Search clients by name, email, or phone"
            placeholder="Search clients…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-surface pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-border-interactive"
            style={{
              height: 'var(--control-height-mobile)',
              borderRadius: 'var(--radius-md)',
              transition: `border-color var(--duration-fast)`,
            }}
          />
        </div>

        {/* Active vs Archived Toggle */}
        <FilterSegmentedControl
          options={filterOptions}
          value={includeArchived ? 'all' : 'active'}
          onChange={(id) => setIncludeArchived(id === 'all')}
          variant="pill"
          testIdPrefix="filter"
          className="self-start sm:self-auto"
        />
      </div>

      {/* CLIENT-004 / Main Content — Loading */}
      {isLoading ? (
        <div
          data-testid="clients-loading-skeleton"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-border bg-surface-muted/50"
            />
          ))}
        </div>
      ) : error ? (
        /* CLIENT-004 — Error state */
        <div
          role="alert"
          data-testid="clients-error-state"
          className="flex flex-col items-center justify-center rounded-xl border p-8 text-center bg-surface border-status-danger-border"
        >
          <AlertCircle className="h-7 w-7 text-status-danger-text mb-2" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-text-primary">Failed to load clients</h3>
          <p className="mt-1 text-xs text-text-secondary max-w-sm">{error.message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
            Retry
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        /* CLIENT-004 — Empty state */
        <EmptyState
          icon={Users}
          title={searchQuery ? 'No matching clients' : 'No clients yet'}
          description={
            searchQuery
              ? 'Try different search terms or clear the filter.'
              : 'Add your first client to manage contacts and project associations.'
          }
          variant="page"
          testId="clients-empty-state"
        />
      ) : (
        /* CLIENT-003 — Client grid */
        <div data-testid="clients-grid" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
