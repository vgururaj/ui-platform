import { useAuth } from '@vgururaj/auth';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@vgururaj/ui';

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <Card data-testid="profile-page">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          <span className="text-muted-foreground">ID:</span> {user.id}
        </p>
        <p>
          <span className="text-muted-foreground">Email:</span> {user.email}
        </p>
        <p>
          <span className="text-muted-foreground">Name:</span> {user.name}
        </p>
        <div className="flex flex-wrap gap-2">
          {user.roles.map((role) => (
            <Badge key={role}>{role}</Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {user.permissions.map((perm) => (
            <Badge key={perm} variant="secondary">
              {perm}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
