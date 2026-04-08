import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import logger from '../logger';

interface HttpClientConfig {
  baseURL: string;
  timeoutMs: number;
  maxRetries: number;
  retryBaseDelayMs: number;
}

interface RetryConfig extends InternalAxiosRequestConfig {
  __retryCount?: number;
}

/**
 * Creates an Axios instance with:
 * - Configurable timeout
 * - Exponential backoff retry on 429 and 5xx
 * - Structured logging on every retry/failure
 */
export function createHttpClient(config: HttpClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeoutMs,
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const cfg = error.config as RetryConfig;
      if (!cfg) throw error;

      cfg.__retryCount = cfg.__retryCount || 0;

      const status = error.response?.status;
      const isRetryable = status === 429 || (status !== undefined && status >= 500);

      if (!isRetryable || cfg.__retryCount >= config.maxRetries) {
        logger.error('HTTP request failed (final)', {
          url: cfg.url,
          method: cfg.method,
          status,
          retries: cfg.__retryCount,
          error: error.message,
        });
        throw error;
      }

      cfg.__retryCount += 1;
      const delay = config.retryBaseDelayMs * Math.pow(2, cfg.__retryCount - 1);

      logger.warn('HTTP request retrying', {
        url: cfg.url,
        attempt: cfg.__retryCount,
        delayMs: delay,
        status,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
      return client(cfg);
    }
  );

  return client;
}

/** Pre-configured clients for common providers */
export const openRouterClient = createHttpClient({
  baseURL: 'https://openrouter.ai/api/v1',
  timeoutMs: 120_000, // 2 min — LLM calls can be slow
  maxRetries: 2,
  retryBaseDelayMs: 1000,
});

export const braveSearchClient = createHttpClient({
  baseURL: 'https://api.search.brave.com/res/v1',
  timeoutMs: 10_000,
  maxRetries: 2,
  retryBaseDelayMs: 500,
});
