import { apiFetchParsed } from '@/lib/api';
import { statsResponseSchema, type StatsResponse } from '../schemas/stats';

export async function getStats(signal?: AbortSignal): Promise<StatsResponse> {
  return apiFetchParsed('/api/stats', statsResponseSchema, { signal });
}
