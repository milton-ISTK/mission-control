import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return Response.json({ error: 'Invalid topic' }, { status: 400 });
    }

    // Create a new DraftEngine project via Convex mutation
    // This should trigger the daemon to start research
    const result = await convex.mutation('draftengine:createProject', {
      topic: topic.trim(),
    } as any);

    // result contains _id and other fields
    const projectId = result._id || result.id;

    return Response.json({
      projectId,
      message: 'Project created, research starting...',
    });
  } catch (error) {
    console.error('POST /api/draftengine/project error:', error);
    return Response.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
