'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/lib/convex-client';

interface Screen8Props {
  project: any;
  workflow: any;
  steps: any[];
  onNext?: () => void;
}

export default function Screen8ImageReview({
  project,
  workflow,
  steps,
  onNext,
}: Screen8Props) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const approveStep = useMutation(api.workflows.approveStepFromUI);
  const updateDraftEngineProject = useMutation(api.draftengine.updateProject);

  // Extract images from de_image_maker step output
  const imageStep = steps.find((s) => s.agentRole === 'de_image_maker');
  const images: any[] = [];

  if (imageStep?.output) {
    try {
      const output = JSON.parse(imageStep.output);
      if (Array.isArray(output)) {
        images.push(...output);
      } else if (Array.isArray(output.images)) {
        images.push(...output.images);
      }
    } catch (e) {
      console.error('Failed to parse images:', e);
    }
  }

  const handleApprove = async () => {
    if (selectedImageIndex === null) {
      alert('Please select an image');
      return;
    }

    setIsApproving(true);
    try {
      const selectedImage = images[selectedImageIndex];
      const selectedImageUrl = selectedImage.url || '';

      // Find the image review step (Step 9: agentRole "none")
      const step9 = steps.find(
        (s) => s.stepNumber === 9 && s.agentRole === 'none'
      );
      if (!step9) throw new Error('Image review step not found');

      // Update project with selected image
      await updateDraftEngineProject({
        projectId: project._id,
        updates: {
          selectedImageIndex,
          selectedImageUrl,
        },
      });

      // Approve the step with selectedOption for image index
      await approveStep({
        stepId: step9._id,
        selectedOption: selectedImageIndex,
        reviewNotes: `Selected image ${selectedImageIndex + 1} of ${images.length}`,
      });

      onNext?.();
    } catch (error) {
      console.error('Failed to approve image:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your Featured Image
        </h2>
        <p className="text-gray-600">
          Select the image that best represents your blog post
        </p>
      </div>

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 mb-8 flex-1 overflow-y-auto">
          {images.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImageIndex(idx)}
              className={`relative rounded-lg overflow-hidden border-4 transition ${
                selectedImageIndex === idx
                  ? 'border-blue-600'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <img
                src={image.url}
                alt={image.description || `Image ${idx + 1}`}
                className="w-full h-40 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                <p className="text-white text-sm font-medium">
                  {image.description || `Image ${idx + 1}`}
                </p>
              </div>
              {selectedImageIndex === idx && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg mb-8">
          <p className="text-gray-500">Loading images...</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedImageIndex(null)}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleApprove}
          disabled={selectedImageIndex === null || isApproving}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApproving ? 'Approving...' : 'Continue to Theme'}
        </button>
      </div>
    </div>
  );
}
