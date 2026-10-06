import { z } from 'zod';

export const uploadStatusSchema = z.enum(['idle', 'uploading', 'success', 'error']);
export type UploadStatus = z.infer<typeof uploadStatusSchema>;

/** MSW / API response from POST /api/uploads */
export const uploadResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  url: z.string(),
});
export type UploadResponse = z.infer<typeof uploadResponseSchema>;
