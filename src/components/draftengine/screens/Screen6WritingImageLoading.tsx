'use client';

import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/lib/convex-client';

interface Screen6Props {
  project: any;
  workflow: any;
  steps: any[];
  onNext?: () => void;
}

const STATUS_DISPLAY = {
  pending: { label: 'Waiting to start', color: 'bg-gray-200' },
  agent_working: { label: 'In progress', color: 'bg-blue-500' },
  completed: { label: 'Complete', color: 'bg-green-500' },
  failed: { label: 'Failed', color: 'bg-red-500' },
  awaiting_review: { label: 'Awaiting review', color: 'bg-yellow-500' },
};

export default function Screen6WritingImageLoading({
  project,
  workflow,
  steps,
  onNext,
}: Screen6Props) {
  const [autoTransitioned, setAutoTransitioned] = useState(false);

  // Fetch fresh workflow state to check step completion
  const workflowData = useQuery(
    api.workflows.getWorkflowWithSteps,
    workflow?._id ? { workflowId: workflow._id } : 'skip'
  );

  // Find blog writer (Step 6) and image maker (Step 7) steps
  const blogStep = steps.find((s) => s.agentRole === 'de_blog_writer');
  const imageStep = steps.find((s) => s.agentRole === 'de_image_maker');

  // Check if both steps are completed
  useEffect(() => {
    if (
      !autoTransitioned &&
      blogStep?.status === 'completed' &&
      imageStep?.status === 'completed'
    ) {
      setAutoTransitioned(true);
      // Auto-transition after a brief delay
      setTimeout(() => onNext?.(), 1000);
    }
  }, [blogStep?.status, imageStep?.status, autoTransitioned, onNext]);

  const blogStatus = blogStep?.status || 'pending';
  const imageStatus = imageStep?.status || 'pending';

  const getProgress = (status: string): number => {
    switch (status) {
      case 'pending':
        return 0;
      case 'agent_working':
        return 50;
      case 'completed':
        return 100;
      case 'failed':
        return 0;
      default:
        return 0;
    }
  };

  const blogProgress = getProgress(blogStatus);
  const imageProgress = getProgress(imageStatus);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Creating Your Blog
        </h2>
        <p className="text-gray-600">
          We're writing your content and generating images
        </p>
      </div>

      {/* Blog Writing Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-900">
            Blog Writing
          </label>
          <span className="text-xs font-medium text-gray-600">
            {STATUS_DISPLAY[blogStatus as keyof typeof STATUS_DISPLAY]?.label || 'Unknown'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              STATUS_DISPLAY[blogStatus as keyof typeof STATUS_DISPLAY]?.color || 'bg-gray-300'
            }`}
            style={{ width: `${blogProgress}%` }}
          />
        </div>
      </div>

      {/* Image Generation Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-900">
            Image Generation
          </label>
          <span className="text-xs font-medium text-gray-600">
            {STATUS_DISPLAY[imageStatus as keyof typeof STATUS_DISPLAY]?.label || 'Unknown'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              STATUS_DISPLAY[imageStatus as keyof typeof STATUS_DISPLAY]?.color || 'bg-gray-300'
            }`}
            style={{ width: `${imageProgress}%` }}
          />
        </div>
      </div>

      {/* Status Messages */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {blogStatus === 'completed' && imageStatus === 'completed' ? (
          <div>
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              All done!
            </h3>
            <p className="text-gray-600">Transitioning to review...</p>
          </div>
        ) : (
          <div>
            <div className="inline-block">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
            <p className="text-gray-600 mt-4">
              {blogStatus !== 'completed' && imageStatus !== 'completed'
                ? 'Creating your blog and images...'
                : blogStatus !== 'completed'
                ? 'Finishing up your blog post...'
                : 'Finalizing images...'}
            </p>
          </div>
        )}
      </div>

      {/* Error State */}
      {(blogStatus === 'failed' || imageStatus === 'failed') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <p className="text-red-600 font-semibold">
            Something went wrong
          </p>
          <p className="text-red-600 text-sm mt-1">
            {blogStatus === 'failed'
              ? 'Blog writing failed. '
              : ''}
            {imageStatus === 'failed'
              ? 'Image generation failed.'
              : ''}
          </p>
        </div>
      )}
    </div>
  );
}
