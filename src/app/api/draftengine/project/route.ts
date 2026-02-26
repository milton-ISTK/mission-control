import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return Response.json({ error: 'Invalid topic' }, { status: 400 });
    }

    // Call Convex mutation via HTTP API
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL not configured');
    }

    const response = await fetch(`${convexUrl}/api/draftengine:createProject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topic.trim() }),
    });

    if (!response.ok) {
      throw new Error(`Convex error: ${response.statusText}`);
    }

    const result = await response.json();
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
