import { delay, http, HttpResponse } from 'msw';
import seedItems from './data/items.json';
import { type Item } from '@/features/items/schemas/item';

let items: Item[] = [...(seedItems as Item[])];

function sortItems(list: Item[], sort: string, order: 'asc' | 'desc') {
  const dir = order === 'desc' ? -1 : 1;
  return [...list].sort((a, b) => {
    const av = String((a as Record<string, unknown>)[sort] ?? '');
    const bv = String((b as Record<string, unknown>)[sort] ?? '');
    return av.localeCompare(bv) * dir;
  });
}

export const handlers = [
  http.get('/api/me', async () => {
    await delay(150);
    return HttpResponse.json({
      id: 'session-user',
      email: 'from-api@demo.local',
      name: 'API Me',
    });
  }),

  http.get('/api/stats', async () => {
    await delay(200);
    return HttpResponse.json({
      totals: {
        items: items.length,
        active: items.filter((i) => i.status === 'active').length,
        draft: items.filter((i) => i.status === 'draft').length,
        archived: items.filter((i) => i.status === 'archived').length,
      },
      byCategory: [
        { name: 'alpha', value: items.filter((i) => i.category === 'alpha').length },
        { name: 'beta', value: items.filter((i) => i.category === 'beta').length },
        { name: 'gamma', value: items.filter((i) => i.category === 'gamma').length },
        { name: 'delta', value: items.filter((i) => i.category === 'delta').length },
      ],
      monthly: [
        { name: 'Jan', value: 12 },
        { name: 'Feb', value: 18 },
        { name: 'Mar', value: 15 },
        { name: 'Apr', value: 22 },
        { name: 'May', value: 19 },
        { name: 'Jun', value: 25 },
      ],
    });
  }),

  http.get('/api/items', async ({ request }) => {
    await delay(180);
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
    const pageSize = Math.max(1, Math.min(50, Number(url.searchParams.get('pageSize') ?? '10')));
    const sort = url.searchParams.get('sort') ?? 'name';
    const order = (url.searchParams.get('order') ?? 'asc') === 'desc' ? 'desc' : 'asc';

    let filtered = items;
    if (q) {
      filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q),
      );
    }

    const sorted = sortItems(filtered, sort, order);
    const start = (page - 1) * pageSize;
    const pageItems = sorted.slice(start, start + pageSize);

    return HttpResponse.json({
      items: pageItems,
      total: sorted.length,
      page,
      pageSize,
      sort,
      order,
    });
  }),

  http.get('/api/items/:id', async ({ params }) => {
    await delay(120);
    const item = items.find((entry) => entry.id === params.id);
    if (!item) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(item);
  }),

  http.post('/api/items', async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Partial<Item>;
    const id = `item-${Date.now()}`;
    const item: Item = {
      id,
      name: body.name ?? 'Untitled',
      description: body.description ?? '',
      status: body.status ?? 'draft',
      category: body.category ?? 'alpha',
      updatedAt: new Date().toISOString(),
    };
    items = [item, ...items];
    return HttpResponse.json(item, { status: 201 });
  }),

  http.delete('/api/items/:id', async ({ params }) => {
    await delay(120);
    const exists = items.some((entry) => entry.id === params.id);
    if (!exists) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    items = items.filter((entry) => entry.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/uploads', async () => {
    await delay(1500);
    return HttpResponse.json({
      id: `upload-${Date.now()}`,
      status: 'ok',
      url: '/uploads/mock-file.bin',
    });
  }),
];

/** Test helper to reset in-memory store */
export function resetItemsFixture() {
  items = [...(seedItems as Item[])];
}
