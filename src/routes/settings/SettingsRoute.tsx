import { useNavigate } from 'react-router';
import { Sparkles, Package, Workflow, Calendar, ChevronRight } from 'lucide-react';

export function SettingsRoute() {
  const navigate = useNavigate();

  const settingSections = [
    {
      title: 'Commercial & Production Catalog',
      description: 'Reusable services, packages, and production stage pipelines.',
      items: [
        {
          title: 'Services Catalog',
          description: 'Individual services, unit pricing, and default hourly rates.',
          icon: Sparkles,
          to: '/services',
          active: true,
        },
        {
          title: 'Packages Catalog',
          description: 'Commercial preset bundles, combined line items, and pricing presets.',
          icon: Package,
          to: '/packages',
          active: true,
        },
        {
          title: 'Workflow Templates',
          description: 'Standardized stage pipelines and milestone checklists for projects.',
          icon: Workflow,
          to: '/workflows',
          active: true,
        },
      ],
    },
    {
      title: 'Future Configurations',
      description: 'Upcoming calendar and storage synchronization integrations.',
      items: [
        {
          title: 'Google Integrations',
          description: 'Google Drive and Google Calendar synchronization (Feature #7 / #8).',
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
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Workspace Settings & Catalog
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Configure your service offerings, commercial packages, and workspace presets.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="space-y-6">
        {settingSections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                {section.title}
              </h2>
              <p className="text-xs text-text-muted">{section.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={itemIdx}
                    role={item.active ? 'button' : undefined}
                    tabIndex={item.active ? 0 : undefined}
                    data-testid={`settings-card-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => item.active && navigate(item.to)}
                    onKeyDown={(e) => {
                      if (item.active && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        navigate(item.to);
                      }
                    }}
                    className={`flex items-start justify-between rounded-2xl border p-5 transition-all ${
                      item.active
                        ? 'border-border bg-surface shadow-xs hover:border-primary/40 hover:bg-surface-muted/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        : 'border-border-subtle bg-surface/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border shrink-0 ${
                          item.active
                            ? 'bg-purple-50 text-primary border-purple-200'
                            : 'bg-surface-muted text-text-muted border-border'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text-primary">{item.title}</h3>
                        <p className="mt-1 text-xs text-text-secondary">{item.description}</p>
                      </div>
                    </div>

                    {item.active && (
                      <ChevronRight className="h-4 w-4 text-text-muted shrink-0 mt-1" />
                    )}
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
