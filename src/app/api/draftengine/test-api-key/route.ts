export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        status: "error",
        message: "ANTHROPIC_API_KEY not set in environment variables",
        solution: "Go to Vercel dashboard → Settings → Environment Variables → Add ANTHROPIC_API_KEY",
      },
      { status: 500 }
    );
  }

  // Check if the key format looks valid
  const isValid = apiKey.startsWith("sk-ant-");

  if (!isValid) {
    return Response.json(
      {
        status: "error",
        message: "ANTHROPIC_API_KEY format is invalid",
        received: `${apiKey.substring(0, 10)}...`,
        expected: "Should start with 'sk-ant-'",
      },
      { status: 500 }
    );
  }

  return Response.json({
    status: "ok",
    message: "ANTHROPIC_API_KEY is configured correctly",
    keyPrefix: `${apiKey.substring(0, 10)}...`,
  });
}
