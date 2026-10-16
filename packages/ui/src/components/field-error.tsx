import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

/** Inline validation message under a form control. Renders nothing when empty. */
export function FieldError({ children, className }: { children?: ReactNode; className?: string }) {
  if (children == null || children === false || children === '') return null;
  return <p className={cn('text-xs text-destructive', className)}>{children}</p>;
}
