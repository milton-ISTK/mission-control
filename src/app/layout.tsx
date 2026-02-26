import type { Metadata, Viewport } from "next";
import { ConvexClientProvider } from "@/lib/convex";
import AuthGuard from "@/components/auth/AuthGuard";
import LayoutWrapper from "@/components/Layout/LayoutWrapper";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ISTK: Agentic Mission Control",
  description:
    "Real-time dashboard for IntelliStake agentic operations — tasks, calendar, memories, team management, and subagent orchestration.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-istk-bg text-istk-text font-sans antialiased">
        <ConvexClientProvider>
          <AuthGuard>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthGuard>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
