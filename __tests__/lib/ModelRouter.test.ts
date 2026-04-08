import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModelRouter } from '../../lib/ai/ModelRouter';

// Mock config module to avoid validation errors
vi.mock('../../lib/config', () => ({
  env: {
    GOOGLE_API_KEY: 'test-api-key',
    OPENROUTER_API_KEY: 'test-api-key',
    BRAVE_SEARCH_API_KEY: 'test-api-key',
  },
  hasSearch: () => true
}));

describe('ModelRouter', () => {
  let router: ModelRouter;

  beforeEach(() => {
    // Re-initialize router before each test
    router = new ModelRouter();
  });

  it('registers gemini and openrouter models', async () => {
    const models = router.getAvailableModels();
    expect(models).toContain('gemini-3.1-flash');
    expect(models).toContain('gpt-4o');
    expect(models).toContain('claude-3.5-sonnet');
  });

  it('throws error for unsupported model id on run', async () => {
    // We expect it to throw on run with an unknown model
    await expect(router.run({ task: 'vision', systemPrompt: '', userPrompt: '' }, 'unknown-model-123'))
      .rejects.toThrow(/Model "unknown-model-123" not found/);
  });
});
