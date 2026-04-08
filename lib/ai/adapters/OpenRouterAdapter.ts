import { BaseAdapter, AIRequest, AIResponse, AdapterConfig } from '../types';
import { openRouterClient } from '../../http/client';
import logger from '../../logger';

export class OpenRouterAdapter extends BaseAdapter {
  constructor(config: AdapterConfig) {
    super(config);
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();

    try {
      const messages: any[] = [];

      // System message
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }

      // User message (text + optional image)
      const userContent: any[] = [{ type: 'text', text: request.userPrompt }];
      if (request.image) {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: `data:${request.image.mimeType};base64,${request.image.data.toString('base64')}`,
          },
        });
      }
      messages.push({ role: 'user', content: userContent });

      const response = await openRouterClient.post('/chat/completions', {
        model: this.config.model,
        messages,
        max_tokens: request.options?.maxTokens ?? this.config.maxTokens ?? 4096,
        temperature: request.options?.temperature ?? this.config.temperature ?? 0.7,
      }, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': 'https://landing-pro.saas',
          'X-Title': 'Landing Page Pro',
        },
      });

      const data = response.data;
      const text = data.choices[0].message.content;
      const latencyMs = Date.now() - start;

      logger.info('OpenRouter call OK', {
        model: this.config.model,
        task: request.task,
        latencyMs,
        tokens: data.usage?.total_tokens,
      });

      return {
        text,
        model: this.config.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens ?? 0,
          completionTokens: data.usage?.completion_tokens ?? 0,
          totalTokens: data.usage?.total_tokens ?? 0,
        },
        latencyMs,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('OpenRouter call FAILED', {
        model: this.config.model,
        task: request.task,
        error: message,
        latencyMs: Date.now() - start,
      });
      throw error;
    }
  }
}
