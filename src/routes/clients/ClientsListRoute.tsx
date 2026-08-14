import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, Users, AlertCircle } from 'lucide-react';
import { useClients, ClientCard } from '@/features/clients';

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

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            Clients
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Customer directory and contact management.
          </p>
        </div>

        <button
          type="button"
          data-testid="add-client-btn"
          onClick={() => navigate('/clients/new')}
          className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-input)] bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-colors duration-[var(--transition-normal)] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>New Client</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            aria-label="Search clients by name, email, or phone"
            placeholder="Search clients…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] rounded-[var(--radius-input)] border border-border bg-surface pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
          />
        </div>

        {/* Active vs Archived Toggle */}
        <div className="flex items-center gap-0.5 rounded-[var(--radius-input)] border border-border bg-surface p-1 self-start sm:self-auto">
          <button
            type="button"
            data-testid="filter-active-clients"
            onClick={() => setIncludeArchived(false)}
            className={`min-h-[36px] cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              !includeArchived
                ? 'bg-surface-muted text-text-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            data-testid="filter-archived-clients"
            onClick={() => setIncludeArchived(true)}
            className={`min-h-[36px] cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              includeArchived
                ? 'bg-surface-muted text-text-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All & Archived
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div
          data-testid="clients-loading-skeleton"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-[var(--radius-card)] border border-border bg-surface-muted/50"
            />
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          data-testid="clients-error-state"
          className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-status-danger/25 bg-surface p-8 text-center"
        >
          <AlertCircle className="h-7 w-7 text-status-danger mb-2" />
          <h3 className="text-sm font-semibold text-text-primary">Failed to load clients</h3>
          <p className="mt-1 text-xs text-text-secondary max-w-sm">{error.message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 cursor-pointer rounded-[var(--radius-input)] bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        <div
          data-testid="clients-empty-state"
          className="flex min-h-[30vh] flex-col items-center justify-center py-12 text-center"
        >
          <Users className="h-8 w-8 text-text-muted mb-3" />
          <h3 className="text-sm font-semibold text-text-primary">
            {searchQuery ? 'No matching clients' : 'No clients yet'}
          </h3>
          <p className="mt-1 max-w-xs text-xs text-text-secondary">
            {searchQuery
              ? 'Try different search terms or clear the filter.'
              : 'Add your first client to manage contacts and project associations.'}
          </p>
        </div>
      ) : (
        <div data-testid="clients-grid" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
