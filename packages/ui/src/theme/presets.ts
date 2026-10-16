/** Named color palettes. Mode (light/dark/system) is separate from preset. */
export const THEME_PRESETS = [
  { id: 'default', label: 'Default' },
  { id: 'slate', label: 'Slate' },
  { id: 'emerald', label: 'Emerald' },
  { id: 'violet', label: 'Violet' },
] as const;

export type ThemePresetId = (typeof THEME_PRESETS)[number]['id'];

export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system'];

export function isThemePresetId(value: string): value is ThemePresetId {
  return THEME_PRESETS.some((preset) => preset.id === value);
}

export function isThemeMode(value: string): value is ThemeMode {
  return THEME_MODES.includes(value as ThemeMode);
}
