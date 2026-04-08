import { GeminiAdapter } from './adapters/GeminiAdapter';
import { OpenRouterAdapter } from './adapters/OpenRouterAdapter';
import { BraveSearchAdapter } from './adapters/BraveSearchAdapter';
import { BaseAdapter, AIRequest, AIResponse, AdapterConfig, SearchResult } from './types';
import { env, hasSearch } from '../config';
import logger from '../logger';

/**
 * ModelRouter — dispatch AI requests to correct adapter.
 *
 * Resolves model IDs like "gemini-3.1-flash" or "claude-3.5-sonnet"
 * to the appropriate adapter. Never exposed to the frontend.
 */
export class ModelRouter {
  private adapters: Map<string, BaseAdapter> = new Map();
  private searchAdapter: BraveSearchAdapter | null = null;

  constructor() {
    // Register adapters based on available env vars
    if (env.GOOGLE_API_KEY) {
      this.registerGemini(env.GOOGLE_API_KEY);
    }
    if (env.OPENROUTER_API_KEY) {
      this.registerOpenRouter(env.OPENROUTER_API_KEY);
    }
    if (hasSearch()) {
      this.searchAdapter = new BraveSearchAdapter(env.BRAVE_SEARCH_API_KEY);
    }

    logger.info('ModelRouter initialized', {
      adapters: Array.from(this.adapters.keys()),
      searchAvailable: !!this.searchAdapter,
    });
  }

  private registerGemini(apiKey: string) {
    const models = ['gemini-3.1-flash', 'gemini-3.1-pro', 'gemini-2.5-pro'];
    for (const model of models) {
      this.adapters.set(model, new GeminiAdapter({ apiKey, model }));
    }
  }

  private registerOpenRouter(apiKey: string) {
    const models: Record<string, string> = {
      'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
      'gpt-4o': 'openai/gpt-4o',
      'gpt-4o-mini': 'openai/gpt-4o-mini',
      'llama-3.1-70b': 'meta-llama/llama-3.1-70b-instruct',
    };
    for (const [alias, fullModel] of Object.entries(models)) {
      this.adapters.set(alias, new OpenRouterAdapter({ apiKey, model: fullModel }));
    }
  }

  /** Get list of available model IDs */
  getAvailableModels(): string[] {
    return Array.from(this.adapters.keys());
  }

  /** Run an AI request through the correct adapter */
  async run(request: AIRequest, modelId: string): Promise<AIResponse> {
    const adapter = this.adapters.get(modelId);
    if (!adapter) {
      const available = this.getAvailableModels().join(', ');
      throw new Error(`Model "${modelId}" not found. Available: ${available}`);
    }

    logger.info('ModelRouter dispatching', { task: request.task, model: modelId });
    return adapter.chat(request);
  }

  /** Run a search query via Brave */
  async search(query: string, count = 5): Promise<SearchResult[]> {
    if (!this.searchAdapter) {
      logger.warn('Search requested but BRAVE_SEARCH_API_KEY not configured');
      return [];
    }
    return this.searchAdapter.search(query, count);
  }
}

/** Singleton instance — created once per process */
let _router: ModelRouter | null = null;

export function getModelRouter(): ModelRouter {
  if (!_router) {
    _router = new ModelRouter();
  }
  return _router;
}
