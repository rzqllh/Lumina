import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { BookOpen, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { guideCategories } from '@/features/guide/data/guideContent';
import { GuideSection } from '@/features/guide/components/GuideSection';
import { GuideCategoryNav } from '@/features/guide/components/GuideCategoryNav';

export function GuideRoute() {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>(guideCategories[0].id);

  // Handle URL hash navigation on mount and location changes
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      // Check if hash is a category id or an entry id
      const targetElement = document.getElementById(hash);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        // Find which category this entry or section belongs to
        const matchedCategory = guideCategories.find(
          (c) => c.id === hash || c.entries.some((e) => e.id === hash)
        );
        if (matchedCategory) {
          setActiveCategory(matchedCategory.id);
        }
      }
    }
  }, [location.hash]);

  const handleSelectCategory = (id: string) => {
    setActiveCategory(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Lumina Guide"
        description="How the current project workflow and tools work."
      />

      {/* Mental Model Flow Banner */}
      <div
        data-testid="guide-mental-model-banner"
        className="rounded-2xl border border-primary-border bg-primary-subtle/50 p-4 sm:p-6 shadow-2xs space-y-3"
      >
        <div className="flex items-center gap-2 text-primary-text font-bold text-xs uppercase tracking-wider">
          <BookOpen className="h-4 w-4 text-primary-text" strokeWidth={1.75} />
          <span>Core Operational Flow</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-text-primary">
          <span className="rounded-lg border border-border bg-surface px-2.5 py-1 shadow-2xs">
            1. Client
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <span className="rounded-lg border border-border bg-surface px-2.5 py-1 shadow-2xs">
            2. Project
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <span className="rounded-lg border border-border bg-surface px-2.5 py-1 shadow-2xs">
            3. Workflow & Sessions
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <span className="rounded-lg border border-border bg-surface px-2.5 py-1 shadow-2xs">
            4. Deliverables & Revisions
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <span className="rounded-lg border border-border bg-surface px-2.5 py-1 shadow-2xs">
            5. Payments
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <span className="rounded-lg border border-border bg-surface px-2.5 py-1 shadow-2xs">
            6. Close Project
          </span>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          This is explanatory navigation for reference, not a rigid sequential constraint. Projects
          can run multiple sessions and active workflow stages in parallel.
        </p>
      </div>

      {/* Main Content Area: Nav + Content */}
      <div className="lg:flex lg:gap-8 items-start">
        {/* Category Navigation */}
        <GuideCategoryNav
          categories={guideCategories}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* Categories Sections */}
        <main className="flex-1 space-y-8 min-w-0 mt-4 lg:mt-0">
          {guideCategories.map((category) => (
            <GuideSection key={category.id} category={category} />
          ))}
        </main>
      </div>
    </div>
  );
}
