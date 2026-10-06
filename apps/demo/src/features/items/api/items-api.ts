import { apiFetchParsed } from '@/lib/api';
import {
  createItemBodySchema,
  itemSchema,
  itemsListResponseSchema,
  type CreateItemBody,
  type Item,
  type ItemsListResponse,
} from '../schemas/item';

export type ListItemsParams = {
  q?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  signal?: AbortSignal;
};

export async function listItems(params: ListItemsParams = {}): Promise<ItemsListResponse> {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.page != null) search.set('page', String(params.page));
  if (params.pageSize != null) search.set('pageSize', String(params.pageSize));
  if (params.sort) search.set('sort', params.sort);
  if (params.order) search.set('order', params.order);
  const qs = search.toString();
  return apiFetchParsed(`/api/items${qs ? `?${qs}` : ''}`, itemsListResponseSchema, {
    signal: params.signal,
  });
}

export async function getItem(id: string, signal?: AbortSignal): Promise<Item> {
  return apiFetchParsed(`/api/items/${id}`, itemSchema, { signal });
}

export async function createItem(body: CreateItemBody, signal?: AbortSignal): Promise<Item> {
  const payload = createItemBodySchema.parse(body);
  return apiFetchParsed('/api/items', itemSchema, {
    method: 'POST',
    body: JSON.stringify(payload),
    signal,
  });
}
