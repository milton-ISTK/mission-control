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
  const [isLoadingHtml, setIsLoadingHtml] = useState(true);

  // Find de_html_builder step by agentRole (like we do for headlines in Screen4)
  useEffect(() => {
    const htmlStep = steps.find((s) => s.agentRole === 'de_html_builder');
    
    // Check if HTML builder is still running
    if (!htmlStep || htmlStep.status !== 'completed') {
      setIsLoadingHtml(true);
      return;
    }

    // HTML builder is complete - extract content
    if (htmlStep?.output) {
      try {
        const output = JSON.parse(htmlStep.output);
        // Handle multiple possible field names
        const html = output.htmlContent || output.html || output.content || htmlStep.output;
        setHtmlContent(html);
        setIsLoadingHtml(false);
      } catch {
        // If JSON parse fails, treat output as raw HTML
        setHtmlContent(htmlStep.output);
        setIsLoadingHtml(false);
      }
    } else {
      setIsLoadingHtml(true);
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

  // If HTML builder is still running, show loading state
  if (isLoadingHtml) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Building your blog page...
          </h2>
          <p className="text-gray-600">
            Our HTML builder is creating your final blog layout. This usually takes a minute.
          </p>
        </div>

        {/* Loading Container */}
        <div className="flex-1 mb-6 overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-b from-gray-50 to-white">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Animated spinner */}
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-75 blur-md animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-600 border-r-orange-600 animate-spin" />
            </div>
            <p className="text-gray-600 font-medium">Generating HTML...</p>
            <p className="text-gray-500 text-sm mt-2">Don't close this window</p>
          </div>
        </div>

        {/* Disabled Action Buttons */}
        <div className="flex gap-3">
          <button
            disabled
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-400 bg-gray-50 cursor-not-allowed"
          >
            ⬇️ Download HTML
          </button>
          <button
            disabled
            className="flex-1 bg-gray-300 text-gray-400 py-3 rounded-lg font-semibold cursor-not-allowed"
          >
            ✨ Finish
          </button>
        </div>
      </div>
    );
  }

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
            sandbox="allow-same-origin"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">No content generated</p>
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
