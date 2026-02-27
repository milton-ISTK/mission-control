'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/lib/convex-client';

interface Screen1TopicInputProps {
  project: any;
  workflow?: any;
  steps?: any[];
  onNext: (data: { topic: string; projectId: string }) => void;
}

export default function Screen1TopicInput({ project, onNext }: Screen1TopicInputProps) {
  const [topic, setTopic] = useState(project?.topic || '');
  const [authorName, setAuthorName] = useState(project?.authorName || '');
  const [sector, setSector] = useState('');
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout>();
  
  const createProject = useMutation(api.draftengine.createProject);

  // Debounced API call for topic suggestions
  const fetchTopicSuggestions = useCallback(async (sectorValue: string) => {
    if (!sectorValue.trim()) {
      setTopicSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch('/api/draftengine/suggest-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector: sectorValue }),
      });

      if (!response.ok) throw new Error('Failed to get suggestions');
      const data = await response.json();
      setTopicSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setTopicSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

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

    setIsLoading(true);
    setError('');
    
    try {
      const result = await createProject({ 
        topic: topic.trim(),
        authorName: authorName.trim() || undefined,
      });
      onNext({ topic: topic.trim(), projectId: result._id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleStartResearch} className="space-y-8">
      {/* Headline */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">What's your blog about?</h1>
        <p className="text-gray-600">Tell us your topic, and we'll research and write it for you.</p>
      </div>

      {/* Topic Input */}
      <div>
        <label htmlFor="topic" className="sr-only">
          Topic
        </label>
        <input
          id="topic"
          type="text"
          placeholder='e.g. "sustainable packaging trends in 2026"'
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isLoading}
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
          disabled={isLoading}
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
            disabled={isLoading}
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
                  setTopicSuggestions([]);
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Start Button */}
      <button
        type="submit"
        disabled={!topic.trim() || isLoading}
        className="w-full py-4 px-6 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
      >
        {isLoading ? '🔍 Researching...' : '🚀 Start Researching'}
      </button>

      {/* Example Topics */}
      <div className="pt-8 border-t border-gray-200">
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
    </form>
  );
}
