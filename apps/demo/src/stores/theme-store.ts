import { createThemeStore } from '@vgururaj/ui';

export const useThemeStore = createThemeStore({
  modeStorageKey: 'demo-theme-mode',
  presetStorageKey: 'demo-theme-preset',
  defaultPreset: 'default',
});

export type { ThemeMode, ThemePresetId } from '@vgururaj/ui';
