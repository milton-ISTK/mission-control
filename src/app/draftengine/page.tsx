'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/lib/convex-client';

export default function DraftEngineLanding() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [sector, setSector] = useState('');
  const [topicSuggestionsRequestId, setTopicSuggestionsRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout>();
  
  const createProject = useMutation(api.draftengine.createProject);
  const requestTopicSuggestions = useMutation(api.draftengine.requestTopicSuggestions);

  // Poll for suggestion results via Convex
  const suggestionRequest = useQuery(
    api.draftengine.getSuggestionRequest,
    topicSuggestionsRequestId ? { requestId: topicSuggestionsRequestId as any } : 'skip'
  );

  const topicSuggestions = suggestionRequest?.suggestions || [];
  const isLoadingSuggestions = topicSuggestionsRequestId && suggestionRequest?.status === "pending";

  // Request topic suggestions via daemon
  const fetchTopicSuggestions = useCallback(async (sectorValue: string) => {
    if (!sectorValue.trim()) {
      setTopicSuggestionsRequestId(null);
      return;
    }

    try {
      const result = await requestTopicSuggestions({ sector: sectorValue });
      setTopicSuggestionsRequestId(result.requestId);
    } catch (err) {
      console.error('Error requesting suggestions:', err);
      setTopicSuggestionsRequestId(null);
    }
  }, [requestTopicSuggestions]);

  // Debounce sector input
  const handleSectorChange = (value: string) => {
    setSector(value);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchTopicSuggestions(value);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Create a new DraftEngine project via Convex with author name
      const result = await createProject({ 
        topic: topic.trim(),
        authorName: authorName.trim() || undefined,
      });
      const projectId = result._id;

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
          <div className="mb-4 flex items-center justify-center">
            <img src="/draftengine-logo.png" alt="DraftEngine" className="h-24" />
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
              className="w-full px-6 py-4 text-lg !text-gray-900 placeholder-gray-400 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
          </div>

          {/* Author Name Input */}
          <div>
            <label htmlFor="authorName" className="block text-sm text-gray-700 mb-2">
              Author Name <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              id="authorName"
              type="text"
              placeholder='Your name (optional)'
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              disabled={loading}
              className="w-full px-6 py-3 text-base !text-gray-900 placeholder-gray-400 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
          </div>

          {/* Sector/Industry Input */}
          <div>
            <label htmlFor="sector" className="block text-sm text-gray-700 mb-2">
              Industry or Sector <span className="text-gray-400 text-xs">(optional - get topic suggestions)</span>
            </label>
            <div className="relative">
              <input
                id="sector"
                type="text"
                placeholder='e.g. fintech, healthcare, sustainability'
                value={sector}
                onChange={(e) => handleSectorChange(e.target.value)}
                disabled={loading}
                className="w-full px-6 py-3 text-base !text-gray-900 placeholder-gray-400 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
              {isLoadingSuggestions && (
                <div className="absolute right-4 top-3.5 text-orange-500 animate-spin">
                  ⏳
                </div>
              )}
            </div>
          </div>

          {/* Topic Suggestions */}
          {topicSuggestions.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Suggested topics for <strong>{sector}</strong>:</p>
              <div className="flex flex-wrap gap-2">
                {topicSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTopic(suggestion);
                      setTopicSuggestionsRequestId(null);
                      setSector('');
                    }}
                    className="px-4 py-2 bg-orange-50 hover:bg-orange-100 border-2 border-orange-300 text-orange-900 rounded-lg font-medium text-sm transition cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

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

        {/* Optional: Example Topics */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">Try a topic like:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'sustainable packaging trends in 2026',
              'AI in healthcare',
              'remote work productivity tips',
              'web3 and the metaverse',
            ].map((exampleTopic) => (
              <button
                key={exampleTopic}
                type="button"
                onClick={() => setTopic(exampleTopic)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition"
              >
                {exampleTopic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
