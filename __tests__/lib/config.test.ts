import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Config', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { NODE_ENV: 'test' } as any;
  });

  it('throws an error if GOOGLE_API_KEY is missing', async () => {
    expect(() => require('../../lib/config').env).toThrow();
  });

  it('loads config properly when all env variables are present', async () => {
    process.env.GOOGLE_API_KEY = 'test-google-key';
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
    process.env.BRAVE_SEARCH_API_KEY = 'test-brave-key';

    const { env } = await import('../../lib/config');

    expect(env.GOOGLE_API_KEY).toBe('test-google-key');
    expect(env.OPENROUTER_API_KEY).toBe('test-openrouter-key');
    expect(env.BRAVE_SEARCH_API_KEY).toBe('test-brave-key');
  });
});
