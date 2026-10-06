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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@vgururaj/ui';

export function AccessPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6" data-testid="access-page">
      <div>
        <h1 className="text-2xl font-semibold">Access demos</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user?.email} — roles: {user?.roles.join(', ')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hide mode</CardTitle>
          <CardDescription>
            Admin-only button is omitted when missing <code>admin:access</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Can
            permission="admin:access"
            mode="hide"
            fallback={
              <p className="text-sm text-muted-foreground" data-testid="can-hide-fallback">
                Admin button hidden
              </p>
            }
          >
            <Button data-testid="can-hide-admin">Hidden unless admin</Button>
          </Can>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disable mode</CardTitle>
          <CardDescription>
            Delete action stays visible but disabled without <code>items:delete</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Can permission="items:delete" mode="disable">
                    <Button variant="destructive" data-testid="can-disable-delete">
                      Delete item
                    </Button>
                  </Can>
                </span>
              </TooltipTrigger>
              <TooltipContent>Requires items:delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
