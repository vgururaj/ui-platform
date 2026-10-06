import { z } from 'zod';

export const itemStatusSchema = z.enum(['active', 'draft', 'archived']);
export const itemCategorySchema = z.enum(['alpha', 'beta', 'gamma', 'delta']);

/** Domain entity returned by the API */
export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.string(),
  category: z.string(),
  updatedAt: z.string(),
});
export type Item = z.infer<typeof itemSchema>;

export const itemsListResponseSchema = z.object({
  items: z.array(itemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  sort: z.string(),
  order: z.enum(['asc', 'desc']),
});
export type ItemsListResponse = z.infer<typeof itemsListResponseSchema>;

/** URL search params for the items table */
export const itemsSearchSchema = z.object({
  q: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
export type ItemsSearch = z.infer<typeof itemsSearchSchema>;

/** Create-item form (UI) — stricter enums for selects */
export const createItemFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  status: itemStatusSchema,
  category: itemCategorySchema,
});
export type CreateItemFormValues = z.infer<typeof createItemFormSchema>;

/** Body posted to POST /api/items (same shape as form for this demo) */
export const createItemBodySchema = createItemFormSchema;
export type CreateItemBody = z.infer<typeof createItemBodySchema>;
