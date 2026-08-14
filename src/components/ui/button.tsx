import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-[var(--radius-input)] transition-all duration-[var(--transition-normal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

    const variantStyles = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline: 'border border-border bg-transparent hover:bg-surface-muted text-text-primary',
      ghost: 'bg-transparent hover:bg-surface-muted text-text-primary',
      danger: 'bg-status-danger text-white hover:bg-status-danger/90',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <Comp
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
