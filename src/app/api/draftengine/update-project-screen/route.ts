import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { workflowId, currentScreen } = await request.json();

    if (!workflowId || !currentScreen) {
      return Response.json(
        { error: 'Missing workflowId or currentScreen' },
        { status: 400 }
      );
    }

    // Call Convex to update the project
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL not configured');
    }

    // Call Convex mutation to update project by workflow ID
    const response = await fetch(`${convexUrl}/api/draftengine:updateProjectByWorkflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowId,
        updates: { currentScreen },
      }),
    });

    if (!response.ok) {
      throw new Error(`Convex error: ${response.statusText}`);
    }

    const result = await response.json();
    return Response.json({ success: true, updated: result });
  } catch (error) {
    console.error('POST /api/draftengine/update-project-screen error:', error);
    return Response.json(
      { error: 'Failed to update project screen' },
      { status: 500 }
    );
  }
}
