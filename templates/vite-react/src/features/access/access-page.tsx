import { Can, useAuth } from '@vgururaj/auth';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@vgururaj/ui';

export function AccessPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Access</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user?.email} — roles: {user?.roles.join(', ')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <code>Can</code> example
          </CardTitle>
          <CardDescription>
            Admin-only button is omitted without <code>admin:access</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Can
            permission="admin:access"
            mode="hide"
            fallback={
              <p className="text-sm text-muted-foreground">
                You do not have <code>admin:access</code>.
              </p>
            }
          >
            <Button type="button">Visible with admin:access</Button>
          </Can>
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>Frontend AuthZ is UX only</AlertTitle>
        <AlertDescription>
          Real APIs must enforce the same checks. Hiding a button does not secure an endpoint.
        </AlertDescription>
      </Alert>
    </div>
  );
}
