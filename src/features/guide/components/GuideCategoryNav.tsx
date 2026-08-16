import React from 'react';
import type { GuideCategory } from '../data/guideContent';

interface GuideCategoryNavProps {
  categories: GuideCategory[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export const GuideCategoryNav: React.FC<GuideCategoryNavProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <>
      {/* Mobile Jump Bar (Horizontal Scroll / Dropdown) */}
      <div className="lg:hidden sticky top-16 z-30 -mx-4 px-4 py-2.5 bg-canvas-bg/95 backdrop-blur-xs border-b border-border-subtle overflow-x-auto no-scrollbar flex items-center gap-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-surface text-text-secondary border border-border hover:bg-surface-muted hover:text-text-primary'
              }`}
            >
              {cat.shortTitle}
            </button>
          );
        })}
      </div>

      {/* Desktop Sticky Table of Contents */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-20 self-start">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted px-2">
            Categories
          </h3>
          <nav className="space-y-0.5" aria-label="Guide Categories">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive
                      ? 'bg-primary-subtle text-primary-text font-bold border border-primary-border'
                      : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                  }`}
                >
                  <span className="truncate">{cat.shortTitle}</span>
                  <span className="text-[10px] text-text-muted tabular-nums">
                    {cat.entries.length}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};
