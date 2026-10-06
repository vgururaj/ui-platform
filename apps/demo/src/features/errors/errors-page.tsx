import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vgururaj/ui';

function Boom(): null {
  throw new Error('Demo error boundary boom');
}

export function ErrorsPage() {
  const [explode, setExplode] = useState(false);
  const query = useQuery({
    queryKey: ['forced-error'],
    queryFn: async () => {
      throw new Error('Forced query failure');
    },
    enabled: false,
    retry: false,
  });

  return (
    <div className="space-y-4" data-testid="errors-page">
      <div>
        <h1 className="text-2xl font-semibold">Error triggers</h1>
        <p className="text-sm text-muted-foreground">Exercise boundary + Query error paths</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Error boundary</CardTitle>
          <CardDescription>Throws during render</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            data-testid="trigger-boundary"
            variant="destructive"
            onClick={() => setExplode(true)}
          >
            Trigger boundary error
          </Button>
          {explode ? <Boom /> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Query error</CardTitle>
          <CardDescription>Fails the React Query request</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            data-testid="trigger-query-error"
            variant="outline"
            onClick={() => void query.refetch()}
          >
            Trigger query error
          </Button>
          {query.isError ? (
            <p className="text-sm text-destructive" data-testid="query-error-message">
              {(query.error as Error).message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
