import type { Metadata } from 'next';
import { ConvexClientProvider } from '@/lib/convex';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'DraftEngine - Create Beautiful Blog Posts',
  description: 'Transform your ideas into beautifully designed blog posts with AI',
};

export default function DraftEngineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-white text-gray-900 font-sans antialiased">
        <ConvexClientProvider>
          {/* Clean full-screen layout for B2C users */}
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
