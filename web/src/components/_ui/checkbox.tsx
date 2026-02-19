'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';

import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & { borderColor?: string }
>(({ className, borderColor = 'border-gray-500', ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      `group peer h-3.5 w-3.5 shrink-0 rounded-sm border border-1.5 ${borderColor} ring-offset-white`,
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#232529] focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-[#05080e] data-[state=checked]:border-[#18181B] data-[state=checked]:text-slate-50',
      'dark:ring-offset-[#0f1013] dark:focus-visible:ring-slate-300',
      'dark:data-[state=checked]:bg-slate-50 dark:data-[state=checked]:border-[#18181B] dark:data-[state=checked]:text-[#18181B]',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      {props.checked === true && <Check className="h-3.5 w-3.5" />}
      {props.checked === 'indeterminate' && <Minus className="h-3.5 w-3.5" />}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
