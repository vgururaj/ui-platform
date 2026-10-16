import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/select';
import { THEME_PRESETS, type ThemePresetId } from './presets';
import type { ThemeStoreHook } from './theme-store';

export type ThemePickerProps = {
  useThemeStore: ThemeStoreHook;
  className?: string;
  /** Accessible label for the select trigger. */
  label?: string;
};

/** Named palette picker (Default, Slate, Emerald, Violet). */
export function ThemePicker({ useThemeStore, className, label = 'Theme' }: ThemePickerProps) {
  const { preset, setPreset } = useThemeStore();
  return (
    <Select value={preset} onValueChange={(value) => setPreset(value as ThemePresetId)}>
      <SelectTrigger className={className ?? 'h-9 w-[8.5rem]'} aria-label={label} title={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {THEME_PRESETS.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
