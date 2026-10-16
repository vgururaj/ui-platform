import type { ReactNode } from 'react';
import { cn } from '../lib/utils';
import { navItemClass } from './nav-item-class';

export type SidebarNavItem = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  active?: boolean;
};

export type SidebarNavRenderProps = {
  className: string;
  active: boolean;
};

export type SidebarNavProps = {
  items: SidebarNavItem[];
  /** App supplies the link element (TanStack Link, Next Link, `<a>`, etc.). */
  renderItem: (item: SidebarNavItem, props: SidebarNavRenderProps) => ReactNode;
  className?: string;
  'aria-label'?: string;
};

/** Router-agnostic sidebar list — product IA and Link components stay in the app. */
export function SidebarNav({
  items,
  renderItem,
  className,
  'aria-label': ariaLabel = 'Primary',
}: SidebarNavProps) {
  return (
    <nav className={cn('flex flex-col gap-1 p-3', className)} aria-label={ariaLabel}>
      {items.map((item) => {
        const active = Boolean(item.active);
        return (
          <div key={item.id}>{renderItem(item, { active, className: navItemClass(active) })}</div>
        );
      })}
    </nav>
  );
}
