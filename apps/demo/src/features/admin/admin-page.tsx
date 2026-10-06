import { useAuth } from '@vgururaj/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@vgururaj/ui';

/**
 * Reachable only after `requirePermission(..., 'admin:access')` in the router.
 * In-page Can/403 demos live on `/access`.
 */
export function AdminPage() {
  const { user } = useAuth();

  return (
    <Card data-testid="admin-page">
      <CardHeader>
        <CardTitle>Admin area</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Welcome, {user?.name}. This route is gated by <code>requirePermission</code> (
        <code>admin:access</code>).
      </CardContent>
    </Card>
  );
}
