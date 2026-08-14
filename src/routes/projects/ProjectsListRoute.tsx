import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, FolderKanban, AlertCircle } from 'lucide-react';
import { useProjects, ProjectCard } from '@/features/projects';

export function ProjectsListRoute() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: projects = [], isLoading, error, refetch } = useProjects(statusFilter);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return projects;

    return projects.filter((project) => {
      const matchTitle = project.title.toLowerCase().includes(query);
      const matchClient = project.client?.display_name
        ? project.client.display_name.toLowerCase().includes(query)
        : false;
      const matchNumber = project.project_number
        ? project.project_number.toLowerCase().includes(query)
        : false;

      return matchTitle || matchClient || matchNumber;
    });
  }, [projects, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Projects Pipeline</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Active creator gigs, client engagements, and foundational project records.
          </p>
        </div>

        <button
          type="button"
          data-testid="create-project-btn"
          onClick={() => navigate('/projects/new')}
          className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          <span>Create Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            aria-label="Search projects by title, client, or number"
            placeholder="Search projects by title, client, or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-border bg-surface pl-10 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 self-start sm:self-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'draft', label: 'Draft' },
            { id: 'archived', label: 'Archived' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-testid={`filter-${tab.id}-projects`}
              onClick={() => setStatusFilter(tab.id)}
              className={`min-h-[40px] cursor-pointer rounded-lg px-3.5 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                statusFilter === tab.id
                  ? 'bg-surface-muted text-text-primary shadow-2xs font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div
          data-testid="projects-loading-skeleton"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-border bg-surface-muted/60"
            />
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          data-testid="projects-error-state"
          className="flex flex-col items-center justify-center rounded-2xl border border-status-danger/25 bg-surface p-8 text-center shadow-xs"
        >
          <AlertCircle className="h-8 w-8 text-status-danger mb-2" />
          <h3 className="text-sm font-bold text-text-primary">Failed to load projects</h3>
          <p className="mt-1 text-xs text-text-secondary max-w-sm">{error.message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 cursor-pointer rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            Retry
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div
          data-testid="projects-empty-state"
          className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-text-muted mb-3">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-text-primary">
            {searchQuery ? 'No matching projects found' : 'No projects in workspace yet'}
          </h3>
          <p className="mt-1 max-w-xs text-xs text-text-muted">
            {searchQuery
              ? 'Try changing your search keywords or clearing the status filter.'
              : 'Create your first project record linked to a client to get started.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              data-testid="empty-create-project-btn"
              onClick={() => navigate('/projects/new')}
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="h-4 w-4" />
              <span>Create Project</span>
            </button>
          )}
        </div>
      ) : (
        <div data-testid="projects-grid" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
