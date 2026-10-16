import { describe, expect, it } from 'vitest';
import { isNavPathActive, navItemClass } from './nav-item-class';

describe('isNavPathActive', () => {
  it('matches home exactly', () => {
    expect(isNavPathActive('/', '/')).toBe(true);
    expect(isNavPathActive('/jobs', '/')).toBe(false);
  });

  it('matches self and nested paths', () => {
    expect(isNavPathActive('/admin', '/admin')).toBe(true);
    expect(isNavPathActive('/admin/users', '/admin')).toBe(true);
    expect(isNavPathActive('/administration', '/admin')).toBe(false);
  });
});

describe('navItemClass', () => {
  it('includes accent styles when active', () => {
    expect(navItemClass(true)).toContain('bg-accent');
    expect(navItemClass(false)).toContain('text-muted-foreground');
  });
});
