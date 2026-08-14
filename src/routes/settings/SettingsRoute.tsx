import { useNavigate } from 'react-router';
import { Sparkles, Package, Workflow, Users, Calendar, ChevronRight } from 'lucide-react';

export function SettingsRoute() {
  const navigate = useNavigate();

  const settingSections = [
    {
      title: 'Catalog',
      items: [
        {
          title: 'Services',
          description: 'Individual services, pricing, and hourly rates.',
          icon: Sparkles,
          to: '/services',
          active: true,
        },
        {
          title: 'Packages',
          description: 'Bundled service presets and pricing.',
          icon: Package,
          to: '/packages',
          active: true,
        },
        {
          title: 'Workflow Templates',
          description: 'Stage pipelines and milestone checklists.',
          icon: Workflow,
          to: '/workflows',
          active: true,
        },
        {
          title: 'Crew & Collaborators',
          description: 'Roodex of second shooters, editors, and assistants.',
          icon: Users,
          to: '/collaborators',
          active: true,
        },
      ],
    },

    {
      title: 'Integrations',
      items: [
        {
          title: 'Google Calendar & Drive',
          description: 'Calendar sync and file storage integration.',
          icon: Calendar,
          to: '#',
          active: false,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
          Settings
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Workspace configuration and service catalog.
        </p>
      </div>

      {/* Settings Groups — clean list, not card grid */}
      <div className="space-y-6">
        {settingSections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 px-1">
              {section.title}
            </h2>

            <div className="rounded-[var(--radius-card)] border border-border bg-surface divide-y divide-border-subtle">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isLink = item.active && item.to !== '#';

                return (
                  <div
                    key={itemIdx}
                    role={isLink ? 'button' : undefined}
                    tabIndex={isLink ? 0 : undefined}
                    aria-disabled={!item.active}
                    data-testid={`settings-card-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => isLink && navigate(item.to)}
                    onKeyDown={(e) => {
                      if (isLink && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        navigate(item.to);
                      }
                    }}
                    className={[
                      'flex items-center justify-between gap-3 px-4 py-3.5 transition-colors',
                      isLink
                        ? 'cursor-pointer hover:bg-surface-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset'
                        : 'cursor-not-allowed opacity-60',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`h-4.5 w-4.5 shrink-0 ${
                          item.active ? 'text-primary' : 'text-text-muted'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-text-primary">{item.title}</h3>
                          {!item.active && (
                            <span className="rounded-[var(--radius-badge)] bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                              Planned
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {isLink && <ChevronRight className="h-4 w-4 text-text-muted shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
