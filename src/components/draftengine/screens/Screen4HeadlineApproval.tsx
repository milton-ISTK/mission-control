'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/lib/convex-client';

interface Screen4Props {
  project: any;
  workflow: any;
  steps: any[];
  onNext?: () => void;
}

export default function Screen4HeadlineApproval({
  project,
  workflow,
  steps,
  onNext,
}: Screen4Props) {
  const [selectedHeadline, setSelectedHeadline] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const approveStep = useMutation(api.workflows.approveStepFromUI);

  const handleApprove = async () => {
    if (!selectedHeadline) {
      alert('Please select a headline');
      return;
    }

    setIsApproving(true);
    try {
      // Find step 4 (headline selection)
      const step4 = steps.find((s) => s.stepNumber === 4);
      if (!step4) throw new Error('Step 4 not found');

      // Approve the step with the selected headline as review notes
      await approveStep({
        stepId: step4._id,
        reviewNotes: `Selected headline: ${selectedHeadline}`,
      });

      onNext?.();
    } catch (error) {
      console.error('Failed to approve headline:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsApproving(false);
    }
  };

  // Extract headlines from step 4 output
  const step4 = steps.find((s) => s.stepNumber === 4);
  const headlines: string[] = [];

  if (step4?.output) {
    try {
      const output = JSON.parse(step4.output);
      if (Array.isArray(output.headlines)) {
        headlines.push(...output.headlines);
      }
    } catch (e) {
      console.error('Failed to parse headlines:', e);
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg mb-6">
        <h2 className="text-2xl font-bold mb-2">Choose Your Headline</h2>
        <p className="text-blue-100">
          Select the headline that best captures your blog's direction
        </p>
      </div>

      {/* Headlines Grid */}
      {headlines.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 mb-6 flex-1 overflow-y-auto">
          {headlines.map((headline, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedHeadline(headline)}
              className={`p-4 text-left rounded-lg border-2 transition ${
                selectedHeadline === headline
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-400'
              }`}
            >
              <div className="font-semibold text-gray-900">{headline}</div>
              {selectedHeadline === headline && (
                <div className="text-sm text-blue-600 mt-2">✓ Selected</div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg mb-6">
          <p className="text-gray-500">Loading headlines...</p>
        </div>
      )}

      {/* Approve Button */}
      <button
        onClick={handleApprove}
        disabled={!selectedHeadline || isApproving}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isApproving ? 'Approving...' : 'Approve & Continue'}
      </button>
    </div>
  );
}
