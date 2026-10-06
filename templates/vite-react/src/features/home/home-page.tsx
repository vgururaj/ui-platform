import { Link } from '@tanstack/react-router';
import { useAuth } from '@vgururaj/auth';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vgururaj/ui';
import { env } from '@/config/env';

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
        <p className="text-sm text-muted-foreground">
          {env.VITE_APP_NAME} — signed in as {user?.name} ({user?.email})
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Starter routes</CardTitle>
          <CardDescription>
            Authenticated shell with permission-gated admin and a <code>Can</code> demo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/admin">Admin</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/access">Access</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
