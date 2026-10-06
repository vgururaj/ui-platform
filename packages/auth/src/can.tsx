import * as React from 'react';
import { useAuth } from './auth-context';
import type { Permission } from './types';

export type CanMode = 'hide' | 'disable';

export interface CanProps {
  permission: Permission;
  mode?: CanMode;
  children: React.ReactElement;
  fallback?: React.ReactNode;
}

/**
 * Conditionally render or disable children based on the current user's permission.
 * - mode="hide" (default): omit children when unauthorized
 * - mode="disable": clone the child with disabled + aria-disabled
 */
export function Can({ permission, mode = 'hide', children, fallback = null }: CanProps) {
  const { can } = useAuth();
  const allowed = can(permission);

  if (allowed) {
    return children;
  }

  if (mode === 'disable') {
    return React.cloneElement(children, {
      disabled: true,
      'aria-disabled': true,
    } as Partial<typeof children.props>);
  }

  return <>{fallback}</>;
}
