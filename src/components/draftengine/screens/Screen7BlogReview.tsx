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

// Detect if content is HTML or plain text
const isHtmlContent = (content: string): boolean => {
  return /<[^>]*>/g.test(content);
};

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
        ) : blogContent ? (
          isHtmlContent(blogContent) ? (
            // Render as HTML
            <div 
              className="overflow-y-auto h-full prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: blogContent }}
              style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#1f2937',
              } as React.CSSProperties}
            />
          ) : (
            // Render as plain text with formatting
            <div className="overflow-y-auto h-full whitespace-pre-wrap text-gray-800 leading-relaxed font-sans">
              {blogContent}
            </div>
          )
        ) : (
          <p className="text-gray-400">Loading blog content...</p>
        )}
      </div>

      {/* Global styles for rendered HTML */}
      <style>{`
        .prose {
          font-size: 16px;
          line-height: 1.6;
          color: #1f2937;
        }

        .prose h1,
        .prose h2,
        .prose h3,
        .prose h4,
        .prose h5,
        .prose h6 {
          color: #111827;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          line-height: 1.25;
        }

        .prose h1 {
          font-size: 2em;
          margin-top: 0.5em;
        }

        .prose h2 {
          font-size: 1.5em;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.3em;
        }

        .prose h3 {
          font-size: 1.25em;
        }

        .prose h4 {
          font-size: 1.1em;
        }

        .prose p {
          margin: 1em 0;
          line-height: 1.8;
        }

        .prose ul,
        .prose ol {
          margin: 1em 0;
          padding-left: 2em;
        }

        .prose li {
          margin: 0.5em 0;
        }

        .prose a {
          color: #2563eb;
          text-decoration: none;
          border-bottom: 1px solid rgba(37, 99, 235, 0.3);
        }

        .prose a:hover {
          color: #1d4ed8;
          border-bottom-color: rgba(29, 78, 216, 0.5);
        }

        .prose strong {
          font-weight: 600;
          color: #111827;
        }

        .prose em {
          font-style: italic;
          color: #374151;
        }

        .prose code {
          background-color: #f3f4f6;
          color: #d97706;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.9em;
        }

        .prose pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1em;
          border-radius: 6px;
          overflow-x: auto;
          margin: 1em 0;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.85em;
          line-height: 1.4;
        }

        .prose blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1em;
          margin: 1em 0;
          color: #6b7280;
          font-style: italic;
        }

        .prose table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }

        .prose th,
        .prose td {
          border: 1px solid #d1d5db;
          padding: 0.75em;
          text-align: left;
        }

        .prose th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #111827;
        }

        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          margin: 1em 0;
        }

        .prose hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2em 0;
        }
      `}</style>

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
