import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, getRouteApi } from '@tanstack/react-router';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  Button,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@vgururaj/ui';
import { listItems } from './api/items-api';
import { type Item, type ItemsSearch } from './schemas/item';

export type { ItemsSearch };

const itemsRouteApi = getRouteApi('/_app/items');

function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export function ItemsPage() {
  const search = itemsRouteApi.useSearch();
  const navigate = itemsRouteApi.useNavigate();
  const [draftQ, setDraftQ] = useState(search.q ?? '');
  const debouncedQ = useDebounced(draftQ, 350);

  useEffect(() => {
    if ((search.q ?? '') === debouncedQ) return;
    void navigate({
      search: (prev) => ({
        ...prev,
        q: debouncedQ || undefined,
        page: 1,
      }),
    });
  }, [debouncedQ, navigate, search.q]);

  const page = search.page ?? 1;
  const pageSize = search.pageSize ?? 10;
  const sort = search.sort ?? 'name';
  const order = search.order ?? 'asc';

  const query = useQuery({
    queryKey: ['items', { q: search.q ?? '', page, pageSize, sort, order }],
    queryFn: ({ signal }) =>
      listItems({
        q: search.q,
        page,
        pageSize,
        sort,
        order,
        signal,
      }),
  });

  const columns = useMemo<ColumnDef<Item>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            to="/items/$id"
            params={{ id: row.original.id }}
            className="font-medium text-primary hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: 'status', header: 'Status' },
      { accessorKey: 'category', header: 'Category' },
      { accessorKey: 'updatedAt', header: 'Updated' },
    ],
    [],
  );

  const sorting: SortingState = [{ id: sort, desc: order === 'desc' }];

  const table = useReactTable({
    data: query.data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: query.data ? Math.ceil(query.data.total / pageSize) : 0,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      const first = next[0];
      void navigate({
        search: (prev) => ({
          ...prev,
          sort: first?.id ?? 'name',
          order: first?.desc ? 'desc' : 'asc',
          page: 1,
        }),
      });
    },
  });

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / pageSize)) : 1;

  return (
    <div className="space-y-4" data-testid="items-page">
      <div>
        <h1 className="text-2xl font-semibold">Items</h1>
        <p className="text-sm text-muted-foreground">
          Server-style search, sort, and pagination synced to the URL
        </p>
      </div>
      <Input
        data-testid="items-search"
        placeholder="Search items…"
        value={draftQ}
        onChange={(e) => setDraftQ(e.target.value)}
      />
      <div className="rounded-md border">
        {query.isLoading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc'
                        ? ' ↑'
                        : header.column.getIsSorted() === 'desc'
                          ? ' ↓'
                          : ''}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-testid="items-row">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground" data-testid="items-total">
          {query.data?.total ?? 0} total
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            data-testid="items-prev"
            disabled={page <= 1}
            onClick={() =>
              void navigate({
                search: (prev) => ({ ...prev, page: Math.max(1, page - 1) }),
              })
            }
          >
            Previous
          </Button>
          <span className="text-sm" data-testid="items-page-label">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            data-testid="items-next"
            disabled={page >= totalPages}
            onClick={() =>
              void navigate({
                search: (prev) => ({ ...prev, page: page + 1 }),
              })
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
