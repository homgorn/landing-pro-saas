import { NextRequest } from 'next/server';
import { ProjectStore } from '../../../lib/store/ProjectStore';
import { runPipeline, PipelineProgress } from '../../../lib/services/PipelineService';
import logger from '../../../lib/logger';
import { z } from 'zod';

/**
 * POST /api/generate
 *
 * Accepts multipart FormData with:
 *   - file: screenshot image (required)
 *   - businessName: string (required)
 *   - niche: string (required)
 *   - visionModel: string (optional, default: gemini-3.1-flash)
 *   - codeModel: string (optional, default: claude-3.5-sonnet)
 *   - searchEnabled: "true" | "false" (optional, default: true)
 *
 * Returns: SSE stream of pipeline progress, final event is the project JSON.
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    
    // Validate file manually since it's a File object not easily validated with basic string Zod schema
    const file = data.get('file') as File | null;
    if (!file) {
      return Response.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ success: false, error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}` }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ success: false, error: 'File too large. Maximum: 10MB' }, { status: 400 });
    }

    const generateSchema = z.object({
      businessName: z.string().min(1, 'Business name is required'),
      niche: z.string().min(1, 'Niche is required'),
      extraPrompt: z.string().optional().default(''),
      mediaLinks: z.string().optional().default(''),
      visionModel: z.string().default('gemini-3.1-flash'),
      codeModel: z.string().default('claude-3.5-sonnet'),
      searchEnabled: z.string().default('true').transform((val) => val !== 'false'),
    });

    const parsed = generateSchema.safeParse({
      businessName: typeof data.get('businessName') === 'string' ? data.get('businessName') : undefined,
      niche: typeof data.get('niche') === 'string' ? data.get('niche') : undefined,
      extraPrompt: typeof data.get('extraPrompt') === 'string' ? data.get('extraPrompt') : undefined,
      mediaLinks: typeof data.get('mediaLinks') === 'string' ? data.get('mediaLinks') : undefined,
      visionModel: data.get('visionModel') || undefined,
      codeModel: data.get('codeModel') || undefined,
      searchEnabled: data.get('searchEnabled') || undefined,
    });

    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { businessName, niche, extraPrompt, mediaLinks, visionModel, codeModel, searchEnabled } = parsed.data;

    // --- Create project ---
    const projectId = `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    await ProjectStore.create({
      id: projectId,
      name: businessName,
      niche,
      pipelineConfig: { visionModel, codeModel, searchEnabled, extraPrompt, mediaLinks },
    });

    // --- Read image buffer ---
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const mimeType = file.type as 'image/png' | 'image/jpeg' | 'image/webp';

    // --- SSE Stream ---
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: any) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        send('started', { projectId });

        try {
          const result = await runPipeline(
            projectId,
            imageBuffer,
            mimeType,
            (progress: PipelineProgress) => {
              send('progress', progress);
            },
          );

          send('complete', {
            projectId: result.id,
            status: result.status,
            htmlLength: result.generatedHtml?.length ?? 0,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          send('error', { projectId, error: message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Generate API error', { error: message });
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
