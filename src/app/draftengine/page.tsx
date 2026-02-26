'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DraftEngineLanding() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Create a new DraftEngine project
      const response = await fetch('/api/draftengine/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const { projectId } = await response.json();

      // Navigate to wizard
      router.push(`/draftengine/project/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <span>⚡</span>
            <span>DraftEngine</span>
          </div>
          <p className="text-xl text-gray-600">
            Transform your idea into a beautifully designed blog post in minutes
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleStartResearch} className="space-y-6">
          {/* Topic Input */}
          <div>
            <label htmlFor="topic" className="sr-only">
              What do you want to write about?
            </label>
            <input
              id="topic"
              type="text"
              placeholder='e.g. "sustainable packaging trends in 2026"'
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
              autoFocus
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* CTA Button */}
          <button
            type="submit"
            disabled={!topic.trim() || loading}
            className="w-full py-4 px-6 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
          >
            {loading ? '🔍 Researching...' : '🚀 Start Researching'}
          </button>
        </form>

        {/* Optional: Recent Topics */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Popular topics:</p>
          <div className="flex flex-wrap gap-2">
            {['sustainable packaging', 'AI in healthcare', 'web3 trends', 'remote work'].map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => setTopic(tag)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition"
                >
                  {tag}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
