import { ApiError } from '@vgururaj/http';
import { describe, expect, it } from 'vitest';

describe('ApiError', () => {
  it('stores status and body', () => {
    const err = new ApiError('nope', 404, { message: 'missing' });
    expect(err.status).toBe(404);
    expect(err.body).toEqual({ message: 'missing' });
    expect(err.message).toBe('nope');
  });
});
