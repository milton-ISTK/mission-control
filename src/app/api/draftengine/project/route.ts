import { NextRequest } from 'next/server';

// This endpoint is a pass-through for validation only.
// Actual Convex calls are made client-side via the Convex client in browser.

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return Response.json({ error: 'Invalid topic' }, { status: 400 });
    }

    // Server-side validation only. Client will call Convex directly.
    return Response.json({
      validated: true,
      topic: topic.trim(),
    });
  } catch (error) {
    console.error('POST /api/draftengine/project error:', error);
    return Response.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
