'use client';

import { Switch as SwitchPrimitive } from 'radix-ui';
import * as React from 'react';
import { cn } from '@/utils/Cn';

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer relative inline-flex h-4 w-7.25 shrink-0 items-center rounded-full border-switch border-text-secondary bg-white outline-none after:absolute after:-inset-x-2 after:-inset-y-3.5 focus-visible:ring-3 focus-visible:ring-ring data-checked:border-brand-dark data-checked:bg-brand-dark data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="-translate-x-0.375 data-checked:translate-x-2.875 pointer-events-none block size-4 shrink-0 rounded-full border-switch border-text-secondary bg-white transition-transform motion-reduce:transition-none data-checked:border-brand-dark"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
