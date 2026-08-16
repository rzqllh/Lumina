import React from 'react';
import {
  Compass,
  UserCheck,
  Briefcase,
  Package,
  GitBranch,
  Calendar,
  FileBox,
  ClipboardList,
  Share2,
  Coins,
  Users,
  CheckCircle2,
  LayoutDashboard,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { GuideCategory } from '../data/guideContent';

const iconMap: Record<string, React.FC<{ className?: string; strokeWidth?: number }>> = {
  Compass,
  UserCheck,
  Briefcase,
  Package,
  GitBranch,
  Calendar,
  FileBox,
  ClipboardList,
  Share2,
  Coins,
  Users,
  CheckCircle2,
  LayoutDashboard,
};

interface GuideSectionProps {
  category: GuideCategory;
}

export const GuideSection: React.FC<GuideSectionProps> = ({ category }) => {
  const Icon = iconMap[category.iconName] || HelpCircle;

  return (
    <section
      id={category.id}
      data-testid={`guide-section-${category.id}`}
      className="scroll-mt-20 rounded-2xl border border-border bg-surface p-5 sm:p-7 shadow-xs space-y-6"
    >
      {/* Category Header */}
      <div className="flex items-start gap-3.5 border-b border-border-subtle pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary-text border border-primary-border shadow-2xs">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary tracking-tight">{category.title}</h2>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-6 divide-y divide-border-subtle/70">
        {category.entries.map((entry, idx) => (
          <div
            key={entry.id}
            id={entry.id}
            data-testid={`guide-entry-${entry.id}`}
            className={`scroll-mt-24 space-y-3.5 ${idx > 0 ? 'pt-6' : ''}`}
          >
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {entry.title}
            </h3>

            {/* What it is */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                What it is
              </span>
              <p className="text-xs text-text-secondary leading-relaxed">{entry.whatItIs}</p>
            </div>

            {/* When to use it */}
            {entry.whenToUse && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                  When to use it
                </span>
                <p className="text-xs text-text-secondary leading-relaxed">{entry.whenToUse}</p>
              </div>
            )}

            {/* What happens */}
            {entry.whatHappens && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                  What happens
                </span>
                <p className="text-xs text-text-secondary leading-relaxed">{entry.whatHappens}</p>
              </div>
            )}

            {/* Bullet Points */}
            {entry.bulletPoints && entry.bulletPoints.length > 0 && (
              <div className="space-y-1.5 rounded-xl border border-border-subtle bg-surface-muted/60 p-3.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block">
                  Definitions & Formulas
                </span>
                <ul className="space-y-1 text-xs text-text-secondary tabular-nums">
                  {entry.bulletPoints.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <span className="text-primary-text font-bold select-none">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Important / Caveats Callout */}
            {entry.important && (
              <div className="flex items-start gap-2.5 rounded-xl border border-status-warning-border/80 bg-status-warning-subtle/70 p-3 text-xs text-status-warning-text">
                <AlertCircle
                  className="h-4 w-4 shrink-0 mt-0.5 text-status-warning-text"
                  strokeWidth={1.75}
                />
                <div className="space-y-0.5">
                  <span className="font-bold block uppercase text-[10px] tracking-wider">
                    Important Note
                  </span>
                  <p className="leading-relaxed">{entry.important}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
