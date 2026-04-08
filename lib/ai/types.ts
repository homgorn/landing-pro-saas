// =============================================================
// AI Layer Type Contracts
// Single source of truth for all AI-related types.
// =============================================================

export type TaskType = 'vision' | 'code' | 'copy' | 'blog' | 'qa';

// --- Request ---

export interface AIRequest {
  task: TaskType;
  systemPrompt: string;
  userPrompt: string;
  image?: {
    data: Buffer;
    mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
  };
  options?: {
    maxTokens?: number;
    temperature?: number;
    responseFormat?: 'text' | 'json';
  };
}

// --- Response ---

export interface AIResponse {
  text: string;
  model: string;
  usage: TokenUsage;
  latencyMs: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// --- Adapter Config ---

export interface AdapterConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

// --- Adapter Health ---

export interface AdapterHealth {
  adapter: string;
  status: 'healthy' | 'degraded' | 'down';
  consecutiveErrors: number;
  lastError: string | null;
  lastSuccessAt: string | null;
  avgLatencyMs: number;
}

// --- Search ---

export interface SearchResult {
  title: string;
  url: string;
  description: string;
}

// --- Abstract Adapter ---

export abstract class BaseAdapter {
  protected config: AdapterConfig;

  constructor(config: AdapterConfig) {
    this.config = config;
  }

  abstract chat(request: AIRequest): Promise<AIResponse>;

  /** Override model for a specific call */
  withModel(model: string): this {
    this.config = { ...this.config, model };
    return this;
  }
}
