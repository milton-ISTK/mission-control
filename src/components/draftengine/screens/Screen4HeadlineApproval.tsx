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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const approveStep = useMutation(api.workflows.approveStepFromUI);

  const handleApprove = async () => {
    if (!selectedHeadline || selectedIndex === null) {
      alert('Please select a headline');
      return;
    }

    setIsApproving(true);
    try {
      // Find the headline generator step (agentRole: de_headline_generator)
      const headlineStep = steps.find((s) => s.agentRole === 'de_headline_generator');
      if (!headlineStep) throw new Error('Headline generator step not found');

      // Parse the selected headline if it's JSON (object format)
      let headlineDisplay = selectedHeadline;
      try {
        const parsed = JSON.parse(selectedHeadline);
        headlineDisplay = parsed.headline || selectedHeadline;
      } catch {
        // It's already a string
      }

      // Approve the step with the selected headline index AND review notes
      await approveStep({
        stepId: headlineStep._id,
        selectedOption: selectedIndex,
        reviewNotes: `Selected headline: ${headlineDisplay}`,
      });

      onNext?.();
    } catch (error) {
      console.error('Failed to approve headline:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsApproving(false);
    }
  };

  // Extract headlines from headline generator step output
  const headlineGeneratorStep = steps.find((s) => s.agentRole === 'de_headline_generator');
  const headlines: any[] = [];

  if (headlineGeneratorStep?.output) {
    try {
      const output = JSON.parse(headlineGeneratorStep.output);
      console.log('Parsed headline output:', output);
      
      if (Array.isArray(output.headlines)) {
        // Format: {headlines: [{headline, hook, style}, ...]}
        headlines.push(...output.headlines);
      } else if (Array.isArray(output)) {
        // Direct array of headlines: [{headline, hook, style}, ...]
        headlines.push(...output);
      }
    } catch (e) {
      console.error('Failed to parse headlines from output:', headlineGeneratorStep.output, e);
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
          {headlines.map((item, idx) => {
            // Handle both string and object formats
            let headlineText = '';
            let hookText = '';
            let headlineStr = '';

            if (typeof item === 'string') {
              headlineText = item;
              headlineStr = item;
            } else if (typeof item === 'object' && item !== null) {
              // Object format: {headline, hook, style}
              headlineText = item.headline || item.text || '';
              hookText = item.hook || item.description || '';
              headlineStr = JSON.stringify(item);
            } else {
              // Fallback for unknown format
              headlineText = String(item);
              headlineStr = String(item);
            }

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedHeadline(headlineStr);
                  setSelectedIndex(idx);
                }}
                className={`p-4 text-left rounded-lg border-2 transition ${
                  selectedHeadline === headlineStr
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-blue-400'
                }`}
              >
                <div className="font-semibold text-gray-900">{headlineText || '(No text)'}</div>
                {hookText && (
                  <div className="text-sm text-gray-600 mt-1">{hookText}</div>
                )}
                {selectedHeadline === headlineStr && (
                  <div className="text-sm text-blue-600 mt-2">✓ Selected</div>
                )}
              </button>
            );
          })}
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
