import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, FolderKanban, AlertCircle, RefreshCw } from 'lucide-react';
import { useProjects, ProjectCard } from '@/features/projects';
import { PageHeader } from '@/components/ui/page-header';
import { FilterSegmentedControl } from '@/components/ui/filter-segmented-control';
import { EmptyState } from '@/components/ui/empty-state';

/**
 * PROJ-001 — Page Header: title + description + Create Project action
 * PROJ-002 — Search + Filters: canonical FilterSegmentedControl
 * PROJ-003 — ProjectCard redesign (in ProjectCard.tsx)
 * PROJ-004 — Loading / Empty / Error: canonical EmptyState
 */
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

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'draft', label: 'Draft' },
    { id: 'archived', label: 'Archived' },
  ];

  return (
    <div className="space-y-5">
      {/* PROJ-001 — Page Header */}
      <PageHeader
        title="Projects"
        description="Manage client engagements and production records."
        actions={
          <button
            type="button"
            data-testid="create-project-btn"
            onClick={() => navigate('/projects/new')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground border border-transparent hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              height: 'var(--control-height-mobile)',
              borderRadius: 'var(--radius-md)',
              transition: `background-color var(--duration-fast)`,
            }}
          >
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            <span>Create Project</span>
          </button>
        }
      />

      {/* PROJ-002 — Search + Filters */}
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
            aria-label="Search projects by title, client, or number"
            placeholder="Search projects…"
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

        {/* Status Filters */}
        <FilterSegmentedControl
          options={filterOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          variant="pill"
          testIdPrefix="filter"
          className="self-start sm:self-auto"
        />
      </div>

      {/* PROJ-004 / Main Content — Loading */}
      {isLoading ? (
        <div
          data-testid="projects-loading-skeleton"
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
        /* PROJ-004 — Error state */
        <div
          role="alert"
          data-testid="projects-error-state"
          className="flex flex-col items-center justify-center rounded-xl border p-8 text-center bg-surface border-border"
        >
          <AlertCircle className="h-7 w-7 text-status-danger-text mb-2" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-text-primary">Failed to load projects</h3>
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
      ) : filteredProjects.length === 0 ? (
        /* PROJ-004 — Empty state */
        <EmptyState
          icon={FolderKanban}
          title={searchQuery ? 'No matching projects' : 'No projects yet'}
          description={
            searchQuery
              ? 'Try different search terms or clear the filter.'
              : 'Create your first project to get started.'
          }
          variant="page"
          testId="projects-empty-state"
        />
      ) : (
        /* PROJ-003 — Project grid */
        <div data-testid="projects-grid" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
