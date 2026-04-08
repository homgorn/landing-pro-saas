import { NextRequest } from 'next/server';
import { ProjectStore } from '../../../lib/store/ProjectStore';
import { cloudflareService } from '../../../lib/services/CloudflareService';
import { z } from 'zod';
import logger from '../../../lib/logger';

const deploySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = deploySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { projectId } = parsed.data;
    const project = await ProjectStore.get(projectId);

    if (!project) {
      return Response.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    if (!project.generatedHtml) {
      return Response.json({ success: false, error: 'Project has no generated HTML' }, { status: 400 });
    }

    if (!cloudflareService.isConfigured) {
      return Response.json({ success: false, error: 'Cloudflare is not configured on the server' }, { status: 500 });
    }

    // Convert spaces/special chars to get a valid subdomain
    const safeProjectName = project.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const projectName = `tmax-${safeProjectName}-${projectId.slice(0, 5)}`;

    const result = await cloudflareService.deployHtml(projectName, project.generatedHtml);
    
    // Update store with deployment info
    const updated = await ProjectStore.update(projectId, {
      status: 'deployed',
    });

    logger.info('Project deployed to Cloudflare', { projectId, url: result.url });

    return Response.json({ success: true, result, project: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Deploy API Error', { error: message });
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
