import { SearchResult } from '../types';
import { braveSearchClient } from '../../http/client';
import logger from '../../logger';

/**
 * Brave Search adapter. Not extending BaseAdapter because
 * search is a fundamentally different operation from chat.
 */
export class BraveSearchAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string, count: number = 5): Promise<SearchResult[]> {
    const start = Date.now();

    try {
      const response = await braveSearchClient.get('/web/search', {
        params: { q: query, count },
        headers: {
          'X-Subscription-Token': this.apiKey,
          Accept: 'application/json',
        },
      });

      const results: SearchResult[] = (response.data.web?.results ?? []).map((r: any) => ({
        title: r.title ?? '',
        url: r.url ?? '',
        description: r.description ?? '',
      }));

      logger.info('Brave Search OK', {
        query,
        resultCount: results.length,
        latencyMs: Date.now() - start,
      });

      return results;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Brave Search FAILED', {
        query,
        error: message,
        latencyMs: Date.now() - start,
      });
      throw error;
    }
  }
}
