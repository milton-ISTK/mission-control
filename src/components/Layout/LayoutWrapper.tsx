'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import FluidBackground from './FluidBackground';
import ClickAnimationHandler from './ClickAnimationHandler';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if this is a DraftEngine route
  const isDraftEngine = pathname?.startsWith('/draftengine');

  // Update body background based on route
  useEffect(() => {
    const body = document.querySelector('body');
    if (body) {
      if (isDraftEngine) {
        body.style.backgroundColor = 'white';
        body.style.color = 'rgb(17, 24, 39)'; // gray-900
      } else {
        body.style.backgroundColor = '';
        body.style.color = '';
      }
    }
  }, [isDraftEngine]);

  // For DraftEngine routes, render without sidebar/navbar/footer
  if (isDraftEngine) {
    return (
      <div className="w-full min-h-screen bg-white text-gray-900">
        {children}
      </div>
    );
  }

  // For all other routes, render Mission Control shell
  return (
    <>
      {/* Click Animation Handler */}
      <ClickAnimationHandler />

      {/* Interactive Fluid/Lava Background */}
      <FluidBackground />

      <div className="relative flex min-h-screen" style={{ zIndex: 1 }}>
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
    </>
  );
}
