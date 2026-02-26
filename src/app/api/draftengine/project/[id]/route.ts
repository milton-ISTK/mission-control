import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Call Convex query via HTTP API
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL not configured');
    }

    const response = await fetch(`${convexUrl}/api/draftengine:getProject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: id }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return Response.json({ error: 'Project not found' }, { status: 404 });
      }
      throw new Error(`Convex error: ${response.statusText}`);
    }

    const result = await response.json();
    return Response.json(result);
  } catch (error) {
    console.error('GET /api/draftengine/project/[id] error:', error);
    return Response.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
