import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PieChart,
  Skeleton,
} from '@vgururaj/ui';
import { getStats } from './api/stats-api';

export function HomePage() {
  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ['stats'],
    queryFn: ({ signal }) => getStats(signal),
  });

  if (isPending && !data) {
    return (
      <div className="grid gap-4 md:grid-cols-4" data-testid="home-loading">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError && !data) {
    return (
      <div className="space-y-3" data-testid="home-error">
        <p>Failed to load stats</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    { label: 'Items', value: data.totals.items },
    { label: 'Active', value: data.totals.active },
    { label: 'Draft', value: data.totals.draft },
    { label: 'Archived', value: data.totals.archived },
  ];

  return (
    <div className="space-y-6" data-testid="home-page">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">MSW-backed stats with Recharts helpers</p>
        </div>
        {isFetching ? (
          <span className="text-xs text-muted-foreground" data-testid="home-refetching">
            Updating…
          </span>
        ) : null}
      </div>
      {isError ? (
        <p className="text-sm text-destructive" data-testid="home-refetch-error">
          Could not refresh stats. Showing last loaded data.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-semibold"
                data-testid={`stat-${card.label.toLowerCase()}`}
              >
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Card data-testid="chart-pie" className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>By category</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <PieChart data={data.byCategory} />
          </CardContent>
        </Card>
        <Card data-testid="chart-bar" className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Monthly trend</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <BarChart data={data.monthly} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
