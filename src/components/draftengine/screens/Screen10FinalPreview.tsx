'use client';

import { useState, useEffect } from 'react';

interface Screen10Props {
  project: any;
  workflow: any;
  steps: any[];
  onNext?: () => void;
}

export default function Screen10FinalPreview({
  project,
  workflow,
  steps,
  onNext,
}: Screen10Props) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Extract HTML from html_builder step (Step 11)
  useEffect(() => {
    const htmlStep = steps.find((s) => s.agentRole === 'html_builder');
    if (htmlStep?.output) {
      try {
        const output = JSON.parse(htmlStep.output);
        const html = output.html || output.htmlContent || htmlStep.output;
        setHtmlContent(html);
      } catch {
        setHtmlContent(htmlStep.output);
      }
    }
  }, [steps]);

  const handleDownloadHTML = () => {
    setIsDownloading(true);
    try {
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent)
      );
      element.setAttribute('download', `${project?.topic || 'blog'}.html`);
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Failed to download:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePublish = () => {
    onNext?.();
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Your Blog is Ready!
        </h2>
        <p className="text-gray-600">
          Preview your blog post and download or publish it
        </p>
      </div>

      {/* Preview Container */}
      <div className="flex-1 mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {htmlContent ? (
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full border-none"
            title="Blog Preview"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">Loading preview...</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleDownloadHTML}
          disabled={!htmlContent || isDownloading}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? 'Downloading...' : '⬇️ Download HTML'}
        </button>
        <button
          onClick={handlePublish}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          ✨ Finish
        </button>
      </div>
    </div>
  );
}
