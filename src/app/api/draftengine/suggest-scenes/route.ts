// Simple in-memory cache
const scenesCache = new Map<string, string[]>();

export async function POST(request: Request) {
  try {
    const { headline } = await request.json();

    if (!headline || typeof headline !== "string" || headline.trim().length === 0) {
      return Response.json(
        { error: "Missing or invalid headline parameter" },
        { status: 400 }
      );
    }

    const headlineKey = headline.toLowerCase().trim().slice(0, 100);

    // Check cache
    if (scenesCache.has(headlineKey)) {
      return Response.json({
        suggestions: scenesCache.get(headlineKey),
        cached: true,
      });
    }

    // Call Claude Haiku via Anthropic API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: `Given this blog headline: '${headline}', suggest 4 short image scene descriptions for a blog hero image. Each should be 1 sentence describing a visual scene. Return ONLY a JSON array of strings, nothing else.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText =
      data.content?.[0]?.type === "text" ? data.content[0].text : "";

    // Parse JSON
    let suggestions: string[] = [];
    try {
      suggestions = JSON.parse(responseText);
      if (!Array.isArray(suggestions)) {
        throw new Error("Response is not an array");
      }
      suggestions = suggestions.slice(0, 4);
    } catch {
      // Fallback suggestions if parsing fails
      suggestions = [
        "Modern professional workspace with natural light and technology",
        "Abstract colorful composition representing innovation and growth",
        "Detailed close-up macro photography of intricate patterns",
        "Wide landscape photography showing perspective and scale",
      ];
    }

    // Cache result
    scenesCache.set(headlineKey, suggestions);

    return Response.json({
      suggestions,
      cached: false,
    });
  } catch (error) {
    console.error("Error suggesting scenes:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to suggest scenes",
      },
      { status: 500 }
    );
  }
}
