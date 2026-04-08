import { getModelRouter } from '../ai/ModelRouter';
import { AIRequest } from '../ai/types';
import logger from '../logger';

/**
 * Blog ArticleGenerator — uses search + AI for RAG-based article generation.
 */
export class ArticleGenerator {
  async generate(topic: string, modelId: string): Promise<string> {
    const router = getModelRouter();
    logger.info('Generating blog article', { topic, modelId });

    try {
      // 1. Research phase (Brave Search)
      const searchResults = await router.search(`${topic} latest trends insights`);
      const context = searchResults
        .map((r) => `- ${r.title}: ${r.description}`)
        .join('\n');

      // 2. Generation phase
      const request: AIRequest = {
        task: 'blog',
        systemPrompt: `You are a Senior SEO & Content Strategist. 
Draft high-quality, authoritative blog articles that match the expertise and authority of the provided topic.
Rules:
- Output semantic HTML5 (articles, sections, etc.). No <html>/<head>/<body> tags.
- Use a professional and engaging tone of voice suitable for the subject matter.
- Include structured data hints and internal linking placeholders.
- Focus on user value and readability.`,
        userPrompt: `Topic: ${topic}\n\nContextual Research Data:\n${context || 'No search results available.'}\n\nWrite a comprehensive and authoritative article. Output pure HTML only.`,
      };

      const response = await router.run(request, modelId);

      logger.info('Blog generation successful', { topic, length: response.text.length });
      return response.text;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Article generation failed', { topic, error: message });
      throw error;
    }
  }
}
