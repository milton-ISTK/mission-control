// Simple in-memory cache (in production, use Redis)
const suggestionsCache = new Map<string, string[]>();

export async function POST(request: Request) {
  try {
    const { sector } = await request.json();

    if (!sector || typeof sector !== "string" || sector.trim().length === 0) {
      return Response.json(
        { error: "Missing or invalid sector parameter" },
        { status: 400 }
      );
    }

    const sectorKey = sector.toLowerCase().trim();

    // Check cache
    if (suggestionsCache.has(sectorKey)) {
      return Response.json({
        suggestions: suggestionsCache.get(sectorKey),
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
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `Given the sector '${sector}', suggest 6 specific blog topic ideas as short titles. Return ONLY a JSON array of strings, nothing else.`,
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
      suggestions = suggestions.slice(0, 6);
    } catch {
      // Fallback suggestions if parsing fails
      suggestions = [
        `Latest ${sector} trends 2026`,
        `How ${sector} is transforming`,
        `${sector} innovation guide`,
        `${sector} industry insights`,
        `Future of ${sector}`,
        `${sector} best practices`,
      ];
    }

    // Cache result
    suggestionsCache.set(sectorKey, suggestions);

    return Response.json({
      suggestions,
      cached: false,
    });
  } catch (error) {
    console.error("Error suggesting topics:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to suggest topics",
      },
      { status: 500 }
    );
  }
}
