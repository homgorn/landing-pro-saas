import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { BaseAdapter, AIRequest, AIResponse, AdapterConfig } from '../types';
import logger from '../../logger';

export class GeminiAdapter extends BaseAdapter {
  private genAI: GoogleGenerativeAI;

  constructor(config: AdapterConfig) {
    super(config);
    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();
    const model = this.genAI.getGenerativeModel({ model: this.config.model });

    try {
      const parts: (string | Part)[] = [];

      // System prompt as first text part
      if (request.systemPrompt) {
        parts.push(request.systemPrompt);
      }
      parts.push(request.userPrompt);

      // Vision: attach image if present
      if (request.image) {
        parts.push({
          inlineData: {
            data: request.image.data.toString('base64'),
            mimeType: request.image.mimeType,
          },
        });
      }

      const result = await model.generateContent(parts);
      const response = result.response;
      const text = response.text();
      const latencyMs = Date.now() - start;

      logger.info('Gemini call OK', {
        model: this.config.model,
        task: request.task,
        latencyMs,
        textLength: text.length,
      });

      return {
        text,
        model: this.config.model,
        usage: {
          promptTokens: 0,  // Gemini SDK doesn't always expose this
          completionTokens: 0,
          totalTokens: 0,
        },
        latencyMs,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Gemini call FAILED', {
        model: this.config.model,
        task: request.task,
        error: message,
        latencyMs: Date.now() - start,
      });
      throw error;
    }
  }
}
