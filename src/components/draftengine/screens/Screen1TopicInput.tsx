'use client';

import { useState } from 'react';

interface Screen1TopicInputProps {
  project: any;
  onNext: (data: { topic: string }) => void;
}

export default function Screen1TopicInput({ project, onNext }: Screen1TopicInputProps) {
  const [topic, setTopic] = useState(project?.topic || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    onNext({ topic: topic.trim() });
  };

  return (
    <form onSubmit={handleStartResearch} className="space-y-8">
      {/* Headline */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">What's your blog about?</h1>
        <p className="text-gray-600">Tell us your topic, and we'll research and write it for you.</p>
      </div>

      {/* Input */}
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
          className="w-full px-6 py-4 text-lg text-gray-900 placeholder-gray-400 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
        />
      </div>

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
