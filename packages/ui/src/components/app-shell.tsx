import * as React from 'react';
import { cn } from '../lib/utils';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  sidebarClassName?: string;
  headerClassName?: string;
  mainClassName?: string;
}

function AppShell({
  sidebar,
  header,
  children,
  className,
  sidebarClassName,
  headerClassName,
  mainClassName,
  ...props
}: AppShellProps) {
  return (
    <div className={cn('flex min-h-screen w-full max-w-none bg-background', className)} {...props}>
      {sidebar ? (
        <aside
          className={cn('hidden w-64 shrink-0 flex-col border-r bg-card md:flex', sidebarClassName)}
        >
          {sidebar}
        </aside>
      ) : null}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {header ? (
          <header
            className={cn(
              'sticky top-0 z-40 flex h-14 w-full items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60',
              headerClassName,
            )}
          >
            {header}
          </header>
        ) : null}
        <main className={cn('w-full flex-1 p-4 md:p-6', mainClassName)}>{children}</main>
      </div>
    </div>
  );
}

export { AppShell };
