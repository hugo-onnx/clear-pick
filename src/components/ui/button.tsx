import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
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
          'bg-gradient-to-r from-cyan-500 to-orange-500 text-white shadow-[0_14px_34px_rgba(6,182,212,0.24)] hover:from-cyan-400 hover:to-orange-400 hover:shadow-[0_18px_42px_rgba(249,115,22,0.24)]',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        ghost:
          'text-muted-foreground hover:bg-white/10 hover:text-white',
        link: 'text-primary underline-offset-4 hover:text-cyan-100 hover:underline',
        outline:
          'border border-white/20 bg-white/5 text-foreground backdrop-blur-sm hover:border-cyan-300/45 hover:bg-white/10 hover:text-cyan-100',
        secondary:
          'border border-white/15 bg-secondary text-secondary-foreground backdrop-blur-sm hover:border-cyan-300/35 hover:bg-white/15 hover:text-cyan-100',
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
