import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadWithProgress } from './upload-with-progress';

class MockXMLHttpRequest {
  static instances: MockXMLHttpRequest[] = [];

  upload = {
    addEventListener: vi.fn((event: string, handler: (e: ProgressEvent) => void) => {
      if (event === 'progress') this._progressHandler = handler;
    }),
  };

  status = 200;
  responseText = '{"ok":true}';
  _progressHandler?: (e: ProgressEvent) => void;
  _loadHandler?: () => void;
  _errorHandler?: () => void;
  _abortHandler?: () => void;
  _aborted = false;
  _headers: Record<string, string> = {};
  open = vi.fn();
  setRequestHeader = vi.fn((key: string, value: string) => {
    this._headers[key] = value;
  });
  send = vi.fn(() => {
    queueMicrotask(() => {
      if (this._aborted) return;
      this._progressHandler?.({
        lengthComputable: true,
        loaded: 50,
        total: 100,
      } as ProgressEvent);
      this._progressHandler?.({
        lengthComputable: true,
        loaded: 100,
        total: 100,
      } as ProgressEvent);
      this._loadHandler?.();
    });
  });
  abort = vi.fn(() => {
    this._aborted = true;
    this._abortHandler?.();
  });
  addEventListener = vi.fn((event: string, handler: () => void) => {
    if (event === 'load') this._loadHandler = handler;
    if (event === 'error') this._errorHandler = handler;
    if (event === 'abort') this._abortHandler = handler;
  });

  constructor() {
    MockXMLHttpRequest.instances.push(this);
  }
}

describe('uploadWithProgress', () => {
  beforeEach(() => {
    MockXMLHttpRequest.instances = [];
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports progress and resolves on success', async () => {
    const onProgress = vi.fn();
    const formData = new FormData();
    formData.append('file', new Blob(['hello']), 'hello.txt');

    const result = await uploadWithProgress({
      url: '/api/upload',
      formData,
      onProgress,
      headers: { 'X-Test': '1' },
    });

    expect(onProgress).toHaveBeenCalledWith(50);
    expect(onProgress).toHaveBeenCalledWith(100);
    expect(result.status).toBe(200);
    expect(result.response).toEqual({ ok: true });

    const xhr = MockXMLHttpRequest.instances[0]!;
    expect(xhr.open).toHaveBeenCalledWith('POST', '/api/upload');
    expect(xhr.setRequestHeader).toHaveBeenCalledWith('X-Test', '1');
  });

  it('rejects when aborted via AbortSignal', async () => {
    const controller = new AbortController();
    const formData = new FormData();

    // Override send so we can abort before load
    const Original = MockXMLHttpRequest;
    class AbortableXHR extends Original {
      override send = vi.fn(() => {
        // do not auto-load; wait for abort
      });
    }
    vi.stubGlobal('XMLHttpRequest', AbortableXHR);

    const promise = uploadWithProgress({
      url: '/api/upload',
      formData,
      signal: controller.signal,
    });

    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rejects on non-2xx status', async () => {
    class FailingXHR extends MockXMLHttpRequest {
      override status = 500;
      override responseText = '{"error":"fail"}';
    }
    vi.stubGlobal('XMLHttpRequest', FailingXHR);

    await expect(
      uploadWithProgress({
        url: '/api/upload',
        formData: new FormData(),
      }),
    ).rejects.toThrow(/status 500/);
  });
});
