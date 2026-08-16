import { useState, useMemo } from 'react';
import { useNavigate, NavLink } from 'react-router';
import { Plus, Search, Sparkles, AlertCircle, Package, Workflow, Users } from 'lucide-react';
import { useServices, ServiceCard } from '@/features/catalog';
import { FilterSegmentedControl } from '@/components/ui/filter-segmented-control';
import { EmptyState } from '@/components/ui/empty-state';

export function ServicesListRoute() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: services = [], isLoading, error, refetch } = useServices(false);

  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      // Filter by active tab
      if (activeTab === 'active' && !srv.is_active) return false;
      if (activeTab === 'archived' && srv.is_active) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchLabel = srv.label.toLowerCase().includes(query);
        const matchDesc = srv.description ? srv.description.toLowerCase().includes(query) : false;
        return matchLabel || matchDesc;
      }

      return true;
    });
  }, [services, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Navigation Tabs between Catalog items */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3 overflow-x-auto">
        <NavLink
          to="/services"
          className="flex items-center gap-1.5 rounded-lg bg-surface-muted px-3 py-1.5 text-xs font-semibold text-text-primary shadow-subtle border border-border shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary-text" strokeWidth={1.75} />
          <span>Services</span>
        </NavLink>
        <NavLink
          to="/packages"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors shrink-0"
        >
          <Package className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Packages</span>
        </NavLink>
        <NavLink
          to="/workflows"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors shrink-0"
        >
          <Workflow className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Workflow Templates</span>
        </NavLink>
        <NavLink
          to="/settings/collaborators"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors shrink-0"
        >
          <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Crew & Collaborators</span>
        </NavLink>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary leading-tight">
            Services Catalog
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Individual creator services, default unit pricing, and standard deliverables.
          </p>
        </div>

        <button
          type="button"
          data-testid="create-service-btn"
          onClick={() => navigate('/services/new')}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-subtle transition-opacity hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          <span>Create Service</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            strokeWidth={1.75}
          />
          <input
            type="text"
            placeholder="Search services by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Status Filters */}
        <FilterSegmentedControl
          variant="pill"
          testIdPrefix="filter"
          value={activeTab}
          onChange={(val) => setActiveTab(val as 'all' | 'active' | 'archived')}
          options={[
            { id: 'all', label: 'All', testId: 'filter-all-services' },
            { id: 'active', label: 'Active', testId: 'filter-active-services' },
            { id: 'archived', label: 'Archived', testId: 'filter-archived-services' },
          ]}
        />
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div
          data-testid="services-loading-skeleton"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-border bg-surface-muted/60"
            />
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          data-testid="services-error-state"
          className="flex flex-col items-center justify-center rounded-xl border border-status-danger-border bg-surface p-8 text-center shadow-subtle"
        >
          <AlertCircle className="h-8 w-8 text-status-danger-text mb-2" strokeWidth={1.75} />
          <h3 className="text-base font-semibold text-text-primary">Failed to load services</h3>
          <p className="mt-1 text-xs text-text-secondary max-w-sm">{error.message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 cursor-pointer rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle"
          >
            Retry
          </button>
        </div>
      ) : filteredServices.length === 0 ? (
        <div data-testid="services-empty-state">
          <EmptyState
            variant="page"
            icon={Sparkles}
            title={searchQuery ? 'No matching services found' : 'No services in catalog yet'}
            description={
              searchQuery
                ? 'Try adjusting your search keywords.'
                : 'Add your individual photography, videography, or editing service rates.'
            }
            action={
              !searchQuery ? (
                <button
                  type="button"
                  data-testid="empty-create-service-btn"
                  onClick={() => navigate('/services/new')}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  <span>Create Service</span>
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div data-testid="services-grid" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
