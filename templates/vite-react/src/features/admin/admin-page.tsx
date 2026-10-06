import { useAuth } from '@vgururaj/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@vgururaj/ui';

export function AdminPage() {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin area</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Welcome, {user?.name}. This route is gated by{' '}
        <code>requirePermission(..., &apos;admin:access&apos;)</code>.
      </CardContent>
    </Card>
  );
}
