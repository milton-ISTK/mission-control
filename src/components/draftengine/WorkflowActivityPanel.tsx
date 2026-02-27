'use client';

import { useQuery } from 'convex/react';
import { api } from '@/lib/convex-client';
import { useState, useEffect } from 'react';

interface WorkflowActivityPanelProps {
  workflowId: string;
  isVisible: boolean; // Only show on screens 2-10
}

export default function WorkflowActivityPanel({
  workflowId,
  isVisible,
}: WorkflowActivityPanelProps) {
  const stats = useQuery(api.draftengine.getWorkflowStats, {
    workflowId: workflowId as any,
  });

  const [displayedTimeSaved, setDisplayedTimeSaved] = useState(0);
  const [formattedElapsed, setFormattedElapsed] = useState('00:00');

  // Animate time saved counter when stats update
  useEffect(() => {
    if (!stats) return;

    const targetSeconds = stats.timeSavedHours * 3600 + stats.timeSavedMinutes * 60;
    
    // Animate from current to target
    if (displayedTimeSaved < targetSeconds) {
      const increment = Math.max(1, Math.ceil((targetSeconds - displayedTimeSaved) / 20));
      const timer = setTimeout(() => {
        setDisplayedTimeSaved(Math.min(displayedTimeSaved + increment, targetSeconds));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [stats, displayedTimeSaved]);

  // Format elapsed time MM:SS
  useEffect(() => {
    if (!stats) return;

    const elapsed = stats.elapsedSeconds;
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    setFormattedElapsed(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  }, [stats]);

  if (!isVisible || !stats) {
    return null;
  }

  // Convert displayed seconds back to hours and minutes for display
  const displayHours = Math.floor(displayedTimeSaved / 3600);
  const displayMins = Math.floor((displayedTimeSaved % 3600) / 60);

  return (
    <>
      {/* Desktop Sidebar (250px sticky panel) */}
      <div className="hidden lg:block fixed right-0 top-0 w-[250px] h-screen bg-gray-950 border-l border-gray-800 p-4 overflow-y-auto z-40">
        <div className="space-y-6">
          {/* Elapsed Time */}
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              Elapsed Time
            </div>
            <div className="text-3xl font-mono font-bold text-gray-100">
              {formattedElapsed}
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">
              Activity
            </div>
            <div className="space-y-2 text-sm">
              {stats.activityLog.map((step, idx) => (
                <div
                  key={`${step.stepNumber}-${idx}`}
                  className="flex items-center justify-between py-2 px-2 rounded bg-gray-900/50 border border-gray-800"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {step.status === 'completed' && (
                      <span className="text-green-400 text-sm flex-shrink-0">✓</span>
                    )}
                    {step.status !== 'completed' && (
                      <span className="text-orange-400 text-sm flex-shrink-0">⏳</span>
                    )}
                    <span className="text-gray-300 truncate text-xs">
                      {step.name}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs flex-shrink-0 ml-2">
                    {step.durationSeconds}s
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Time Saved (Hero Element) */}
          <div className="border-t border-gray-800 pt-6">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">
              Time Saved
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-orange-400 tabular-nums">
                {displayHours}h {displayMins}m
              </div>
              <div className="text-xs text-orange-300 mt-2">
                by AI agents working for you
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Badge (bottom-right floating) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <div className="bg-orange-500 text-white rounded-full p-3 shadow-lg flex items-center justify-center min-w-[60px] h-[60px] font-bold text-sm text-center">
          <span>
            {displayHours}h<br />{displayMins}m
          </span>
        </div>
      </div>
    </>
  );
}
