import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Can } from '@vgururaj/auth';
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
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@vgururaj/ui';
import { createItem } from './api/items-api';
import { createItemFormSchema, type CreateItemFormValues } from './schemas/item';

/** Create-item form demo (route `/forms`). Lives in the items feature — no cross-feature imports. */
export function FormsPage() {
  const queryClient = useQueryClient();
  const form = useForm<CreateItemFormValues>({
    resolver: zodResolver(createItemFormSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'draft',
      category: 'alpha',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: CreateItemFormValues) => createItem(values),
    onSuccess: async () => {
      toast.success('Item created');
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ['items'] });
      await queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Create failed'),
  });

  return (
    <div className="mx-auto max-w-lg space-y-4" data-testid="forms-page">
      <div>
        <h1 className="text-2xl font-semibold">Create item</h1>
        <p className="text-sm text-muted-foreground">
          React Hook Form + Zod (gated by posts:write)
        </p>
      </div>
      <Alert>
        <AlertTitle>Permission note</AlertTitle>
        <AlertDescription>
          Seed <code>user@demo.local</code> has <code>posts:write</code> (not{' '}
          <code>items:write</code>). Admin has both.
        </AlertDescription>
      </Alert>
      <Can
        permission="posts:write"
        mode="hide"
        fallback={
          <Alert variant="destructive" data-testid="forms-forbidden">
            <AlertTitle>Missing posts:write</AlertTitle>
            <AlertDescription>Sign in as admin or user to create items.</AlertDescription>
          </Alert>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>New item</CardTitle>
            <CardDescription>Validated client-side before POST /api/items</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" data-testid="form-name" {...form.register('name')} />
                {form.formState.errors.name ? (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  data-testid="form-description"
                  {...form.register('description')}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(v) =>
                    form.setValue('status', v as CreateItemFormValues['status'])
                  }
                >
                  <SelectTrigger data-testid="form-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">draft</SelectItem>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="archived">archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.watch('category')}
                  onValueChange={(v) =>
                    form.setValue('category', v as CreateItemFormValues['category'])
                  }
                >
                  <SelectTrigger data-testid="form-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alpha">alpha</SelectItem>
                    <SelectItem value="beta">beta</SelectItem>
                    <SelectItem value="gamma">gamma</SelectItem>
                    <SelectItem value="delta">delta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" data-testid="form-submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving…' : 'Create'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Can>
    </div>
  );
}
