import { describe, expect, it } from 'vitest';
import { ApiError } from './api';

describe('api wiring', () => {
  it('re-exports ApiError from @vgururaj/http', () => {
    const err = new ApiError('nope', 404);
    expect(err.status).toBe(404);
    expect(err.name).toBe('ApiError');
  });
});
