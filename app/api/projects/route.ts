import { NextRequest } from 'next/server';
import { ProjectStore } from '../../../lib/store/ProjectStore';
import { z } from 'zod';

/** GET /api/projects — list all projects */
export async function GET() {
  const projects = await ProjectStore.list();
  return Response.json({ projects });
}

const deleteSchema = z.object({
  id: z.string().min(1, 'id param required'),
});

/** DELETE /api/projects?id=xxx — delete a project */
export async function DELETE(req: NextRequest) {
  const parsed = deleteSchema.safeParse({ id: req.nextUrl.searchParams.get('id') });
  
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const deleted = await ProjectStore.delete(parsed.data.id);
  if (!deleted) {
    return Response.json({ error: 'Project not found' }, { status: 404 });
  }
  return Response.json({ success: true });
}
