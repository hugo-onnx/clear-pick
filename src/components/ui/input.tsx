import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => (
    <input
      className={cn(
        'flex h-11 w-full rounded-md border border-input bg-white/10 px-3 py-2 text-[15px] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] caret-primary outline-none transition duration-200 placeholder:text-muted-foreground focus-visible:border-cyan-300/45 focus-visible:ring-4 focus-visible:ring-cyan-300/15',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

export { Input };
