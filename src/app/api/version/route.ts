export async function GET() {
  return Response.json({
    timestamp: new Date().toISOString(),
    buildDate: process.env.BUILD_DATE || "unknown",
    version: "20260227-screen1-updates",
  });
}
