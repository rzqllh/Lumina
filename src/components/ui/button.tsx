import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

/**
 * G-008 — Button Action Hierarchy
 * Four canonical variants:
 * - default (primary): solid Lumina Violet — one dominant action per context
 * - outline (secondary): bordered surface — secondary actions
 * - ghost (tertiary): transparent — low-emphasis actions
 * - danger: danger state — destructive confirmations only
 * - icon: icon-only button (must carry aria-label)
 *
 * Rules:
 * - One dominant action per local context
 * - Mobile h-11 (44px touch target), desktop h-[38px]
 * - Tactile active feedback via scale
 * - No invented actions
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    const base =
      'inline-flex items-center justify-center font-medium rounded-md cursor-pointer ' +
      'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
      'disabled:opacity-50 disabled:pointer-events-none ' +
      'active:scale-[0.985] active:translate-y-px';

    const variants: Record<string, string> = {
      default:
        'bg-primary text-primary-foreground hover:bg-primary-hover border border-transparent',
      outline:
        'border border-border bg-surface text-text-primary hover:bg-surface-muted hover:border-border-interactive',
      ghost: 'bg-transparent text-text-primary hover:bg-surface-muted border border-transparent',
      danger: 'bg-status-danger text-white hover:bg-status-danger/90 border border-transparent',
    };

    /* Desktop standard = 38px, mobile touch = 44px via min-h on sm/md/lg */
    const sizes: Record<string, string> = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-[38px] min-h-[44px] sm:min-h-[38px] px-4 text-sm gap-2',
      lg: 'h-11 px-5 text-base gap-2',
      icon: 'h-[38px] w-[38px] min-h-[44px] min-w-[44px] sm:min-h-[38px] sm:min-w-[38px] p-0',
    };

    return (
      <Comp
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        style={{
          transitionDuration: 'var(--duration-fast)',
          transitionTimingFunction: 'var(--ease-standard)',
          borderRadius: 'var(--radius-md)',
        }}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
