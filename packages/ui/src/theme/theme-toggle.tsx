import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '../components/button';
import type { ThemeStoreHook } from './theme-store';

export type ThemeToggleProps = {
  useThemeStore: ThemeStoreHook;
  className?: string;
};

/** Cycles light → dark → system. Pair with ThemePicker for named palettes. */
export function ThemeToggle({ useThemeStore, className }: ThemeToggleProps) {
  const { mode, cycleMode } = useThemeStore();
  const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor;
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={cycleMode}
      aria-label={`Color mode: ${mode}`}
      title={`Color mode: ${mode}`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
