export async function GET() {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL not set");
    }

    // Call the Convex HTTP API to create a suggestion request
    // This is equivalent to calling requestTopicSuggestions({ sector: "wine" })
    const response = await fetch(`${convexUrl}/api/draftengine/create-project`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Using a placeholder auth header—Convex HTTP endpoints in this context don't require it
      },
      body: JSON.stringify({
        sector: "wine",
      }),
    });

    if (!response.ok) {
      throw new Error(`Convex API error: ${response.statusText}`);
    }

    const data = await response.json();

    return Response.json({
      ok: true,
      message: "✅ Test: suggestion request should appear in Convex immediately",
      data,
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
