import * as React from 'react';
import { cn } from '@/lib/utils';

const variantClasses = {
  default:
    'bg-primary text-primary-foreground shadow-[0_18px_40px_rgba(155,87,46,0.22)] hover:bg-primary/[0.92]',
  secondary:
    'border border-border/[0.7] bg-white/[0.7] text-foreground hover:bg-white/[0.88]',
  ghost: 'text-foreground/80 hover:bg-white/60 hover:text-foreground',
  outline:
    'border border-primary/[0.25] bg-transparent text-primary hover:bg-primary/[0.08]',
} as const;

const sizeClasses = {
  default: 'h-11 px-5 text-sm',
  sm: 'h-9 px-3.5 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-11 w-11',
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, type = 'button', variant = 'default', size = 'default', ...props },
    ref,
  ) => (
    <button
        className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/[0.2] disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  ),
);

Button.displayName = 'Button';

export { Button };
