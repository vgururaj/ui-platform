import { Link } from '@tanstack/react-router';
import { Button } from '@vgururaj/ui';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Button asChild>
        <Link to="/">Go home</Link>
      </Button>
    </div>
  );
}
