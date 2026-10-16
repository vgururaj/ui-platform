import { cn } from '../lib/utils';

export type NavItemVariant = 'sidebar' | 'tab';

/** Active / inactive class string for sidebar links or section tabs. */
export function navItemClass(
  active: boolean,
  options?: { variant?: NavItemVariant; className?: string },
): string {
  const variant = options?.variant ?? 'sidebar';
  if (variant === 'tab') {
    return cn(
      'rounded-md px-3 py-1.5 text-sm transition-colors',
      active
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      options?.className,
    );
  }
  return cn(
    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
    active
      ? 'bg-accent text-accent-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    options?.className,
  );
}

/** Path active helper — `/` is exact; other routes match self or nested paths. */
export function isNavPathActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
}
