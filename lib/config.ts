import { z } from 'zod';

/**
 * Validated environment configuration.
 * Fails fast at startup if required vars are missing.
 */
const envSchema = z.object({
  // AI Providers — at least one must be present for generation to work
  GOOGLE_API_KEY: z.string().optional().default(''),
  OPENROUTER_API_KEY: z.string().optional().default(''),

  // Search
  BRAVE_SEARCH_API_KEY: z.string().optional().default(''),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Node
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
}

/** Singleton — parsed once, reused everywhere */
export const env = loadEnv();

/** Check if we have at least one AI provider configured */
export function hasAIProvider(): boolean {
  return !!(env.GOOGLE_API_KEY || env.OPENROUTER_API_KEY);
}

/** Check if search is available */
export function hasSearch(): boolean {
  return !!env.BRAVE_SEARCH_API_KEY;
}
