import type { Metadata, Viewport } from "next";
import { ConvexClientProvider } from "@/lib/convex";
import Sidebar from "@/components/Layout/Sidebar";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
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
  themeColor: "#0D0D14",
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
          <div className="flex min-h-screen">
            {/* Sidebar — collapses to icon bar on mobile */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Top Navbar */}
              <Navbar />

              {/* Page Content */}
              <main className="flex-1 overflow-auto p-6 lg:p-8">
                {children}
              </main>

              {/* Footer */}
              <Footer />
            </div>
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
