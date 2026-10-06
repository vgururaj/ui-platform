import { z } from 'zod';

export const statsResponseSchema = z.object({
  totals: z.object({
    items: z.number(),
    active: z.number(),
    draft: z.number(),
    archived: z.number(),
  }),
  byCategory: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
    }),
  ),
  monthly: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
    }),
  ),
});
export type StatsResponse = z.infer<typeof statsResponseSchema>;
