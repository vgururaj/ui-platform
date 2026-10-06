import { useThemeStore } from '@/stores/theme-store';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vgururaj/ui';

export function SettingsPage() {
  const { mode, setMode } = useThemeStore();
  return (
    <Card data-testid="settings-page">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Theme preference (also available in the top bar)</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
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
      </CardContent>
    </Card>
  );
}
