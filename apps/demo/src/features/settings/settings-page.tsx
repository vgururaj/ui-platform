import { useThemeStore } from '@/stores/theme-store';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  THEME_PRESETS,
  ThemePicker,
} from '@vgururaj/ui';

export function SettingsPage() {
  const { mode, setMode, preset } = useThemeStore();
  return (
    <Card data-testid="settings-page">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Color mode and named palette (also available in the top bar). Current palette: {preset}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(['light', 'dark', 'system'] as const).map((value) => (
            <Button
              key={value}
              variant={mode === value ? 'default' : 'outline'}
              onClick={() => setMode(value)}
              data-testid={`theme-${value}`}
            >
              {value}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ThemePicker useThemeStore={useThemeStore} />
          <p className="text-sm text-muted-foreground">{THEME_PRESETS.length} palettes available</p>
        </div>
      </CardContent>
    </Card>
  );
}
