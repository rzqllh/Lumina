import React from 'react';
import { Link } from 'react-router';
import { Sparkles, Package, Workflow, Users, Calendar, BookOpen, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';

/**
 * SET-001 — Page Header: canonical PageHeader
 * SET-002 — Settings grouping/row hierarchy using semantic surface tokens
 * SET-003 — Planned integrations: canonical 'planned' StatusBadge, disabled treatment
 */

const settingSections: {
  title: string;
  items: {
    title: string;
    description: string;
    icon: React.FC<{ className?: string; strokeWidth?: number }>;
    to: string;
    active: boolean;
  }[];
}[] = [
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
        description: 'Rolodex of second shooters, editors, and assistants.',
        icon: Users,
        to: '/settings/collaborators',
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
  {
    title: 'Help',
    items: [
      {
        title: 'Lumina Guide',
        description: 'Learn how projects, payments, deliverables, sharing, and closure work.',
        icon: BookOpen,
        to: '/settings/guide',
        active: true,
      },
    ],
  },
];

export function SettingsRoute() {
  return (
    <div className="space-y-6">
      {/* SET-001 — Page Header */}
      <PageHeader title="Settings" description="Workspace configuration and service catalog." />

      {/* SET-002 — Settings Groups */}
      <div className="space-y-6">
        {settingSections.map((section) => (
          <div key={section.title}>
            {/* Section label — eyebrow style */}
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 px-1">
              {section.title}
            </h2>

            {/* Row list */}
            <div className="rounded-xl border border-border bg-surface divide-y divide-border-subtle overflow-hidden">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isLink = item.active && item.to !== '#';

                if (isLink) {
                  return (
                    <Link
                      key={item.title}
                      to={item.to}
                      data-testid={`settings-card-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset transition-colors duration-fast"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Icon spot */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-primary-subtle text-primary-text border-primary-border">
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-text-primary">{item.title}</h3>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5 truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className="h-4 w-4 text-text-muted shrink-0"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.title}
                    aria-disabled={true}
                    data-testid={`settings-card-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-not-allowed opacity-50 transition-colors duration-fast"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon spot — disabled */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-surface-muted text-text-muted border-border-subtle">
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-text-primary">{item.title}</h3>
                          {/* SET-003 — Planned badge */}
                          <StatusBadge variant="planned" label="Planned" />
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>
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
