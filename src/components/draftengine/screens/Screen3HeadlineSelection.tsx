'use client';

import { useState } from 'react';

interface Screen3HeadlineSelectionProps {
  project: any;
  headlines?: string[];
  onNext: (data: { selectedHeadline: string }) => void;
}

const SAMPLE_HEADLINES = [
  'The Future of Sustainable Packaging: Trends That Matter in 2026',
  'How Eco-Conscious Brands Are Changing the Packaging Industry',
  'Sustainable Packaging Trends: What Every Business Needs to Know',
  'From Plastic to Purpose: The Packaging Revolution Is Here',
  'Why Sustainable Packaging Is No Longer Optional',
  'The Hidden Costs of Single-Use Packaging (And What Replaces It)',
  'Green Packaging Innovations That Are Actually Making a Difference',
  'Building a Sustainable Brand: The Packaging Factor',
  'The Circular Economy: How Packaging Drives Real Change',
  'Consumer Demand for Sustainable Packaging: A Data-Driven Look',
];

export default function Screen3HeadlineSelection({
  project,
  headlines = SAMPLE_HEADLINES,
  onNext,
}: Screen3HeadlineSelectionProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (headline: string) => {
    setSelected(headline);
  };

  const handleContinue = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    onNext({ selectedHeadline: selected });
  };

  return (
    <div className="space-y-8">
      {/* Headline */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pick a headline</h2>
        <p className="text-gray-600 mt-2">
          Which direction do you like best? We can customize it later.
        </p>
      </div>

      {/* Headline Grid */}
      <div className="grid grid-cols-1 gap-3">
        {headlines.map((headline, index) => (
          <button
            key={index}
            onClick={() => handleSelect(headline)}
            className={`p-4 text-left rounded-lg border-2 transition-all ${
              selected === headline
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                  selected === headline
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {selected === headline && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <p className="text-gray-900 font-medium">{headline}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={!selected || isSubmitting}
        className="w-full py-4 px-6 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
      >
        {isSubmitting ? 'Continuing...' : 'Continue'}
      </button>
    </div>
  );
}
