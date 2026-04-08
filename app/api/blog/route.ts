import { NextRequest } from 'next/server';
import { ArticleGenerator } from '../../../lib/blog/ArticleGenerator';
import logger from '../../../lib/logger';
import { z } from 'zod';

const blogSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(500),
  modelId: z.string().optional().default('gemini-3.1-flash'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = blogSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { topic, modelId } = parsed.data;

    const generator = new ArticleGenerator();
    const content = await generator.generate(topic.trim(), modelId);

    return Response.json({ success: true, content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Blog API Error', { error: message });
    return Response.json({ success: false, error: 'Failed to generate article' }, { status: 500 });
  }
}
