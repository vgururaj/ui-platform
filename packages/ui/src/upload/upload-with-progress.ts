export interface UploadWithProgressOptions {
  url: string;
  formData: FormData;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export interface UploadWithProgressResult {
  status: number;
  responseText: string;
  response: unknown;
}

/**
 * Upload FormData via XHR with 0–100 progress callbacks and AbortSignal support.
 */
export function uploadWithProgress(
  options: UploadWithProgressOptions,
): Promise<UploadWithProgressResult> {
  const { url, formData, method = 'POST', headers, onProgress, signal } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    const abort = () => {
      xhr.abort();
      reject(new DOMException('Upload aborted', 'AbortError'));
    };

    if (signal) {
      if (signal.aborted) {
        abort();
        return;
      }
      signal.addEventListener('abort', abort, { once: true });
    }

    xhr.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable || !onProgress) return;
      const percent = Math.min(100, Math.max(0, Math.round((event.loaded / event.total) * 100)));
      onProgress(percent);
    });

    xhr.addEventListener('load', () => {
      if (signal) {
        signal.removeEventListener('abort', abort);
      }
      if (onProgress) onProgress(100);

      let response: unknown = xhr.responseText;
      try {
        response = JSON.parse(xhr.responseText) as unknown;
      } catch {
        // keep text
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          status: xhr.status,
          responseText: xhr.responseText,
          response,
        });
        return;
      }

      reject(
        Object.assign(new Error(`Upload failed with status ${xhr.status}`), {
          status: xhr.status,
          responseText: xhr.responseText,
          response,
        }),
      );
    });

    xhr.addEventListener('error', () => {
      if (signal) {
        signal.removeEventListener('abort', abort);
      }
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      if (signal) {
        signal.removeEventListener('abort', abort);
      }
      reject(new DOMException('Upload aborted', 'AbortError'));
    });

    xhr.open(method, url);
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }
    }
    xhr.send(formData);
  });
}
