'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/lib/convex-client';

interface Screen5Props {
  project: any;
  workflow: any;
  steps: any[];
  onNext?: () => void;
}

const STYLE_OPTIONS = [
  { id: 'photograph', label: 'Photograph', icon: '📷' },
  { id: 'illustrated', label: 'Illustrated', icon: '🎨' },
  { id: 'cgi', label: 'CGI', icon: '🖥️' },
  { id: 'watercolour', label: 'Watercolour', icon: '🌊' },
  { id: 'minimalist', label: 'Minimalist', icon: '⬜' },
  { id: 'abstract', label: 'Abstract', icon: '✨' },
];

export default function Screen5ImageStyleSelector({
  project,
  workflow,
  steps,
  onNext,
}: Screen5Props) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [sceneDescription, setSceneDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approveStep = useMutation(api.workflows.approveStepFromUI);
  const updateDraftEngineProject = useMutation(api.draftengine.updateProject);

  const handleSubmit = async () => {
    if (!selectedStyle) {
      alert('Please select an image style');
      return;
    }

    setIsSubmitting(true);
    try {
      // Find the image style selection step (Step 5: agentRole "none")
      const step5 = steps.find(
        (s) => s.stepNumber === 5 && s.agentRole === 'none'
      );
      if (!step5) throw new Error('Image style selection step not found');

      // Update DraftEngine project with selections
      await updateDraftEngineProject({
        projectId: project._id,
        updates: {
          imageStyle: selectedStyle,
          imageSceneDescription: sceneDescription,
        },
      });

      // Approve the step
      await approveStep({
        stepId: step5._id,
        reviewNotes: `Selected style: ${selectedStyle}${sceneDescription ? `. Scene: ${sceneDescription}` : ''}`,
      });

      onNext?.();
    } catch (error) {
      console.error('Failed to submit image style:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your Image Style
        </h2>
        <p className="text-gray-600">
          Select the visual style that best matches your blog's tone
        </p>
      </div>

      {/* Style Options Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {STYLE_OPTIONS.map((style) => (
          <button
            key={style.id}
            onClick={() => setSelectedStyle(style.id)}
            className={`p-6 rounded-lg border-2 transition text-center ${
              selectedStyle === style.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="text-4xl mb-3">{style.icon}</div>
            <div className="font-semibold text-gray-900">{style.label}</div>
            {selectedStyle === style.id && (
              <div className="text-sm text-blue-600 mt-2">✓ Selected</div>
            )}
          </button>
        ))}
      </div>

      {/* Scene Description */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Optional: Describe the scene
        </label>
        <textarea
          value={sceneDescription}
          onChange={(e) => setSceneDescription(e.target.value)}
          placeholder="e.g., 'Professional office setting' or 'Cosy cafe with warm lighting'"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Help our image generator create the perfect visuals
        </p>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedStyle || isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Processing...' : 'Next: Generate Images'}
      </button>
    </div>
  );
}
