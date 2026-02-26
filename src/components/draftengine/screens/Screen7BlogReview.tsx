'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/lib/convex-client';

interface Screen7Props {
  project: any;
  workflow: any;
  steps: any[];
  onNext?: () => void;
}

export default function Screen7BlogReview({
  project,
  workflow,
  steps,
  onNext,
}: Screen7Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [blogContent, setBlogContent] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const approveStep = useMutation(api.workflows.approveStepFromUI);

  // Extract blog content from de_blog_writer step output
  const blogWriterStep = steps.find((s) => s.agentRole === 'de_blog_writer');
  const displayContent = isEditing ? blogContent : blogContent;

  // Initialize blog content on mount
  const [initialized, setInitialized] = useState(false);
  if (!initialized && blogWriterStep?.output && !blogContent) {
    try {
      const output = JSON.parse(blogWriterStep.output);
      const content =
        output.content ||
        output.revisedContent ||
        output.blogContent ||
        output.output ||
        blogWriterStep.output;
      setBlogContent(content);
      setInitialized(true);
    } catch {
      setBlogContent(blogWriterStep.output);
      setInitialized(true);
    }
  }

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      // Find the blog review step (Step 8: agentRole "none")
      const step8 = steps.find(
        (s) => s.stepNumber === 8 && s.agentRole === 'none'
      );
      if (!step8) throw new Error('Blog review step not found');

      // Approve the step with any edited content
      await approveStep({
        stepId: step8._id,
        reviewNotes: isEditing ? blogContent : 'Blog approved as-is',
      });

      onNext?.();
    } catch (error) {
      console.error('Failed to approve blog:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Review Your Blog Post
        </h2>
        <p className="text-gray-600">
          Read through your post and make any final edits
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          {isEditing ? '✓ Done Editing' : '✏️ Edit'}
        </button>
        {isEditing && (
          <span className="text-xs text-blue-600 font-medium">
            Edit mode active
          </span>
        )}
      </div>

      {/* Blog Content Area */}
      <div className="flex-1 overflow-hidden mb-6 bg-white border border-gray-200 rounded-lg p-6">
        {isEditing ? (
          <textarea
            value={blogContent}
            onChange={(e) => setBlogContent(e.target.value)}
            className="w-full h-full p-4 border border-gray-300 rounded resize-none focus:outline-none focus:border-blue-600 font-mono text-sm"
            style={{ fontFamily: 'ui-monospace, monospace' }}
          />
        ) : (
          <div className="prose prose-sm max-w-none overflow-y-auto h-full">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {blogContent || (
                <p className="text-gray-400">
                  Loading blog content...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsEditing(false)}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApproving ? 'Approving...' : 'Approve & Continue'}
        </button>
      </div>
    </div>
  );
}
