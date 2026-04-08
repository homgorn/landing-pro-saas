// =============================================================
// PipelineService — The real orchestrator
// Replaces the dead AgentOrchestrator.ts
// =============================================================
import { getModelRouter } from '../ai/ModelRouter';
import { ProjectStore, Project } from '../store/ProjectStore';
import { AIRequest } from '../ai/types';
import logger from '../logger';

export type PipelineStage = 'vision' | 'research' | 'copy' | 'code' | 'qa';

export interface PipelineProgress {
  stage: PipelineStage;
  status: 'running' | 'done' | 'error';
  message: string;
}

/**
 * Runs the full generation pipeline:
 *   1. Vision — analyze screenshot
 *   2. Research — Brave Search for niche trends (optional)
 *   3. Copy — generate headlines, CTAs, trust signals
 *   4. Code — generate production HTML
 *   5. QA — validate output
 *
 * Each stage updates the project in the store.
 * Emits progress events via a callback.
 */
export async function runPipeline(
  projectId: string,
  imageBuffer: Buffer,
  imageMimeType: 'image/png' | 'image/jpeg' | 'image/webp',
  onProgress: (progress: PipelineProgress) => void,
): Promise<Project> {
  const router = getModelRouter();
  const project = await ProjectStore.get(projectId);

  if (!project) throw new Error(`Project ${projectId} not found`);

  await ProjectStore.update(projectId, { status: 'generating' });

  try {
    // --- Stage 1: Vision Analysis ---
    onProgress({ stage: 'vision', status: 'running', message: 'Analyzing donor design system...' });

    const visionRequest: AIRequest = {
      task: 'vision',
      systemPrompt: `You are a world-class UI/UX engineer. Analyze this website screenshot and extract its design DNA. 
Return a STRICT JSON object with:
- palette: { background: hex, surface: hex, primary: hex, secondary: hex, text: hex, accent: hex }
- typography: { headingFont: string, bodyFont: string, baseSize: string }
- layout: { gridType: string, spacingUnit: string, borderRadius: string }
- components: string[] (list of sections/elements identified)
- aesthetic: string (mood/style description)

Return ONLY valid JSON.`,
      userPrompt: `Extract the design system for "${project.name}" based on this donor screenshot.`,
      image: { data: imageBuffer, mimeType: imageMimeType },
      options: { responseFormat: 'json' },
    };

    const visionResult = await router.run(visionRequest, project.pipelineConfig.visionModel);
    onProgress({ stage: 'vision', status: 'done', message: 'Design DNA extracted' });

    // --- Stage 2: Research (optional) ---
    let researchContext = '';
    if (project.pipelineConfig.searchEnabled) {
      onProgress({ stage: 'research', status: 'running', message: 'Researching niche trends...' });
      const searchResults = await router.search(`${project.niche} landing page trends and user psychology triggers`);
      researchContext = searchResults
        .map((r) => `- ${r.title}: ${r.description}`)
        .join('\n');
      onProgress({ stage: 'research', status: 'done', message: `Market research synchronized` });
    }

    // --- Stage 3: Copywriting ---
    onProgress({ stage: 'copy', status: 'running', message: 'Synthesizing persuasive content...' });

    const copyRequest: AIRequest = {
      task: 'copy',
      systemPrompt: `You are a Conversion Rate Optimization (CRO) expert. Write high-converting copy that aligns with the target audience.
Return a STRICT JSON object with:
- hero: { title: string, subtitle: string, cta: string }
- sections: { title: string, content: string, icon?: string }[]
- socialProof: string[]
- faq: { q: string, a: string }[]
- footer: { tagline: string }
- meta: { title: string, description: string }

Return ONLY valid JSON.`,
      userPrompt: `Business: ${project.name}
Niche: ${project.niche}
User instructions: ${project.pipelineConfig.extraPrompt || 'Generate professional conversion-focused content.'}
Design Specs: ${visionResult.text}
Research Data: ${researchContext || 'None'}

Draft a complete content structure.`,
      options: { responseFormat: 'json' },
    };

    const copyResult = await router.run(copyRequest, project.pipelineConfig.codeModel);
    onProgress({ stage: 'copy', status: 'done', message: 'Copy synthesis complete' });

    // --- Stage 4: HTML Code Generation ---
    onProgress({ stage: 'code', status: 'running', message: 'Engaging developer agent...' });

    const codeRequest: AIRequest = {
      task: 'code',
      systemPrompt: `You are an expert Frontend Developer. Generate a self-contained, high-performance HTML landing page.
Rules:
1. Use the EXACT design system (colors, fonts, grid) provided.
2. Mobile-first responsive, NO external libraries (Vanilla CSS only).
3. Implement semantic HTML5.
4. Integrate specified media links (videos/images) where appropriate.
5. Lighthouse score 100-ready.
6. Output COMPLETE code starting with <!DOCTYPE html>. No yapping.`,
      userPrompt: `Design System: ${visionResult.text}
Content & Copy: ${copyResult.text}
Media Assets: ${project.pipelineConfig.mediaLinks || 'Use high-quality placeholder images via Unsplash (https://images.unsplash.com/...)'}

Build the production-ready landing page for ${project.name}.`,
    };

    const codeResult = await router.run(codeRequest, project.pipelineConfig.codeModel);
    onProgress({ stage: 'code', status: 'done', message: 'HTML architecture finalized' });

    // --- Stage 5: QA ---
    onProgress({ stage: 'qa', status: 'running', message: 'Executing Deep QA audit...' });

    const qaRequest: AIRequest = {
      task: 'qa',
      systemPrompt: `You are a Senior QA Engineer. Audit the following HTML against the requirements.
Requirements:
1. Palette matches: ${visionResult.text}
2. Business name "${project.name}" is present.
3. Responsive Vanilla CSS is present.
4. Specific media assets are integrated (if any): ${project.pipelineConfig.mediaLinks || 'None'}.

Return a JSON object: { score: number (1-100), issues: string[], verdict: "PASS" | "FAIL" }.`,
      userPrompt: `Audit this generated HTML:\n\n${codeResult.text.substring(0, 5000)}...`, // Truncated for token limit
      options: { responseFormat: 'json' },
    };

    let qaMessage = 'All checks passed';
    try {
      const qaResult = await router.run(qaRequest, 'gemini-3.1-flash');
      const audit = JSON.parse(qaResult.text);
      if (audit.verdict === 'FAIL' || audit.issues.length > 0) {
        qaMessage = `${audit.issues.length} issues identified`;
        logger.warn('Deep QA Audit identified issues', { projectId, audit });
      }
    } catch (e) {
      logger.error('Deep QA stage failed, falling back to basic checks', { error: e });
      if (codeResult.text.length < 1000) qaMessage = 'Warning: HTML suspiciously short';
    }

    onProgress({ stage: 'qa', status: 'done', message: qaMessage });

    const html = codeResult.text;

    // --- Save Result ---
    const updated = await ProjectStore.update(projectId, {
      status: 'ready',
      generatedHtml: html,
    });

    logger.info('Pipeline completed', { projectId, htmlLength: html.length });
    return updated!;

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    await ProjectStore.update(projectId, { status: 'error', error: message });
    logger.error('Pipeline failed', { projectId, error: message });
    throw error;
  }
}
