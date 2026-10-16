import { createThemeStore } from '@vgururaj/ui';

/** App theme store: color mode × named palette (Default / Slate / Emerald / Violet). */
export const useThemeStore = createThemeStore({
  modeStorageKey: 'app-theme-mode',
  presetStorageKey: 'app-theme-preset',
  defaultPreset: 'default',
});

export type { ThemeMode, ThemePresetId } from '@vgururaj/ui';
