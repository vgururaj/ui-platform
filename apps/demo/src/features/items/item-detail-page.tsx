import { useQuery } from '@tanstack/react-query';
import { Link, getRouteApi } from '@tanstack/react-router';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@vgururaj/ui';
import { ApiError } from '@/lib/api';
import { getItem } from './api/items-api';

const itemDetailRouteApi = getRouteApi('/_app/items/$id');

export function ItemDetailPage() {
  const { id } = itemDetailRouteApi.useParams();
  const query = useQuery({
    queryKey: ['item', id],
    queryFn: ({ signal }) => getItem(id, signal),
  });

  if (query.isLoading) return <Skeleton className="h-40 w-full" />;

  if (query.isError) {
    const status = query.error instanceof ApiError ? query.error.status : 500;
    return (
      <Alert variant="destructive" data-testid="item-not-found">
        <AlertTitle>{status === 404 ? '404 Not Found' : 'Error'}</AlertTitle>
        <AlertDescription>
          Item <code>{id}</code> could not be loaded.
          <div className="mt-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/items">Back to items</Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  const item = query.data!;
  return (
    <div className="space-y-4" data-testid="item-detail">
      <div className="text-sm text-muted-foreground">
        <Link to="/items" className="hover:underline">
          Items
        </Link>{' '}
        / {item.name}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{item.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>{item.description}</p>
          <p>
            <span className="text-muted-foreground">Status:</span> {item.status}
          </p>
          <p>
            <span className="text-muted-foreground">Category:</span> {item.category}
          </p>
          <p>
            <span className="text-muted-foreground">Updated:</span> {item.updatedAt}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
