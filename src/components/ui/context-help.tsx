import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { HelpCircle, X, ArrowRight } from 'lucide-react';

export interface ContextHelpProps {
  title: string;
  description: React.ReactNode;
  guideAnchor?: string;
  guideLabel?: string;
  className?: string;
  testId?: string;
  size?: 'sm' | 'md';
}

export const ContextHelp: React.FC<ContextHelpProps> = ({
  title,
  description,
  guideAnchor,
  guideLabel = 'Read full guide',
  className = '',
  testId,
  size = 'sm',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const guideHref = guideAnchor
    ? `/settings/guide${guideAnchor.startsWith('#') ? guideAnchor : `#${guideAnchor}`}`
    : '/settings/guide';

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        data-testid={testId || `context-help-trigger-${title.toLowerCase().replace(/\s+/g, '-')}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Help: ${title}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="inline-flex items-center justify-center rounded-full p-1 text-text-muted hover:text-primary-text hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
      >
        <HelpCircle
          className={size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          data-testid={testId ? `${testId}-popover` : 'context-help-popover'}
          className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:absolute sm:inset-auto sm:top-full sm:left-0 sm:translate-y-2 z-50 w-auto sm:w-80 rounded-xl border border-border bg-surface p-4 shadow-sheet space-y-3 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-start justify-between gap-2 border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary-text border border-primary-border">
                <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
              <h3 className="text-xs font-bold text-text-primary">{title}</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label="Close help"
              className="rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>

          <div className="text-xs text-text-secondary leading-relaxed space-y-2">
            {typeof description === 'string' ? <p>{description}</p> : description}
          </div>

          {guideAnchor && (
            <div className="border-t border-border-subtle pt-2">
              <Link
                to={guideHref}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                <span>{guideLabel}</span>
                <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
