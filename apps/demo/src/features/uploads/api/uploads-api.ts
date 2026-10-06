import { uploadWithProgress } from '@vgururaj/ui';
import { uploadResponseSchema, type UploadResponse } from '../schemas/upload';

export type UploadFileParams = {
  file: File;
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
};

export async function uploadFile(params: UploadFileParams): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', params.file);
  const result = await uploadWithProgress({
    url: '/api/uploads',
    formData,
    signal: params.signal,
    onProgress: params.onProgress,
  });
  return uploadResponseSchema.parse(result.response);
}
