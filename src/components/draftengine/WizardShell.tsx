'use client';

import React from 'react';
import WorkflowActivityPanel from './WorkflowActivityPanel';

interface WizardShellProps {
  currentScreen: number;
  totalScreens: number;
  children: React.ReactNode;
  onPrevious: () => void;
  onExit: () => void;
  canGoPrevious: boolean;
  workflowId?: string;
}

const SCREEN_NAMES = [
  'Topic',
  'Research',
  'Headlines',
  'Image Style',
  'Creating',
  'Blog Review',
  'Image Review',
  'Design',
  'Preview',
  'Delivery',
];

export default function WizardShell({
  currentScreen,
  totalScreens,
  children,
  onPrevious,
  onExit,
  canGoPrevious,
  workflowId,
}: WizardShellProps) {
  const progress = (currentScreen / totalScreens) * 100;
  // Show activity panel on screens 2-10 (currentScreen > 1)
  const showActivityPanel = Boolean(currentScreen > 1 && workflowId);

  return (
    <div className="min-h-screen bg-white lg:mr-[250px]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <img src="/draftengine-logo.png" alt="DraftEngine" className="h-10" />
          <button
            onClick={onExit}
            className="text-sm text-gray-600 hover:text-gray-900 transition"
          >
            ✕ Exit
          </button>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-600">
              Step {currentScreen} of {totalScreens}
            </span>
            <span className="text-xs text-gray-600 font-medium">
              {SCREEN_NAMES[currentScreen - 1]}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        {children}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="px-6 py-2 text-gray-700 disabled:text-gray-300 hover:bg-gray-100 rounded-lg transition disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          {/* Next button is handled by individual screens */}
        </div>
      </div>

      {/* Spacer for fixed footer */}
      <div className="h-20" />

      {/* Activity Panel (Desktop sidebar + Mobile badge) */}
      {workflowId && (
        <WorkflowActivityPanel
          workflowId={workflowId}
          isVisible={showActivityPanel}
        />
      )}
    </div>
  );
}
