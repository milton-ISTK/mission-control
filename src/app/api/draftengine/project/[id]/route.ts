import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    if (!projectId) {
      return Response.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Fetch project from Convex
    const result = await convex.query('draftengine:getProjectById', {
      projectId,
    });

    if (!result) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    return Response.json(result);
  } catch (error) {
    console.error('GET /api/draftengine/project/[id] error:', error);
    return Response.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
