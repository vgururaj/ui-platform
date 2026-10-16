import { create } from 'zustand';
import {
  THEME_MODES,
  THEME_PRESETS,
  isThemeMode,
  isThemePresetId,
  type ThemeMode,
  type ThemePresetId,
} from './presets';

export type ThemeStoreOptions = {
  /** localStorage key for mode (default `app-theme-mode`). */
  modeStorageKey?: string;
  /** localStorage key for preset (default `app-theme-preset`). */
  presetStorageKey?: string;
  /** Initial preset when nothing stored (default `default`). */
  defaultPreset?: ThemePresetId;
};

export type ThemeState = {
  mode: ThemeMode;
  preset: ThemePresetId;
  setMode: (mode: ThemeMode) => void;
  setPreset: (preset: ThemePresetId) => void;
  cycleMode: () => void;
  cyclePreset: () => void;
  /** @deprecated Use cycleMode — kept for scaffold drop-in compatibility. */
  cycle: () => void;
};

function resolveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

function applyTheme(mode: ThemeMode, preset: ThemePresetId) {
  const resolved = resolveMode(mode);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.dataset.theme = preset;
  document.documentElement.dataset.mode = resolved;
}

function readStoredMode(key: string): ThemeMode {
  const raw = localStorage.getItem(key);
  if (raw && isThemeMode(raw)) return raw;
  // Migrate older single-key stores that only held mode.
  return 'system';
}

function readStoredPreset(key: string, fallback: ThemePresetId): ThemePresetId {
  const raw = localStorage.getItem(key);
  if (raw && isThemePresetId(raw)) return raw;
  return fallback;
}

/**
 * Create an app theme store (mode × named preset).
 * Call once in the app and export `useThemeStore` from a thin local module if needed.
 */
export function createThemeStore(options: ThemeStoreOptions = {}) {
  const modeKey = options.modeStorageKey ?? 'app-theme-mode';
  const presetKey = options.presetStorageKey ?? 'app-theme-preset';
  const defaultPreset = options.defaultPreset ?? 'default';

  // Back-compat: older apps used a single `app-theme` key for mode only.
  const legacy = localStorage.getItem('app-theme');
  if (legacy && isThemeMode(legacy) && !localStorage.getItem(modeKey)) {
    localStorage.setItem(modeKey, legacy);
  }

  const initialMode = readStoredMode(modeKey);
  const initialPreset = readStoredPreset(presetKey, defaultPreset);
  applyTheme(initialMode, initialPreset);

  const useThemeStore = create<ThemeState>((set, get) => ({
    mode: initialMode,
    preset: initialPreset,
    setMode: (mode) => {
      localStorage.setItem(modeKey, mode);
      applyTheme(mode, get().preset);
      set({ mode });
    },
    setPreset: (preset) => {
      localStorage.setItem(presetKey, preset);
      applyTheme(get().mode, preset);
      set({ preset });
    },
    cycleMode: () => {
      const next = THEME_MODES[(THEME_MODES.indexOf(get().mode) + 1) % THEME_MODES.length]!;
      get().setMode(next);
    },
    cyclePreset: () => {
      const ids = THEME_PRESETS.map((p) => p.id);
      const next = ids[(ids.indexOf(get().preset) + 1) % ids.length]!;
      get().setPreset(next);
    },
    cycle: () => get().cycleMode(),
  }));

  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (useThemeStore.getState().mode === 'system') {
        applyTheme('system', useThemeStore.getState().preset);
      }
    });
  }

  return useThemeStore;
}

export type ThemeStoreHook = ReturnType<typeof createThemeStore>;
