import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-11 px-5 py-2',
        icon: 'h-10 w-10',
        lg: 'h-12 px-8',
        sm: 'h-9 px-4',
      },
      variant: {
        default:
          'bg-gradient-to-r from-cyan-600 to-orange-600 text-white shadow-[0_12px_28px_rgba(8,145,178,0.2)] hover:from-cyan-500 hover:to-orange-500 hover:shadow-[0_16px_34px_rgba(234,88,12,0.18)]',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        ghost:
          'text-muted-foreground hover:bg-slate-900/5 hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:text-cyan-700 hover:underline',
        outline:
          'border border-border bg-white/70 text-foreground shadow-sm hover:border-primary/35 hover:bg-white hover:text-cyan-800',
        secondary:
          'border border-border bg-secondary text-secondary-foreground shadow-sm hover:border-primary/35 hover:bg-white hover:text-cyan-800',
      },
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { asChild = false, className, type = 'button', variant, size, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ className, size, variant }))}
        ref={ref}
        type={asChild ? undefined : type}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
