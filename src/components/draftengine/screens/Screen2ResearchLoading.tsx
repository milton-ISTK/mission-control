'use client';

import { useEffect, useState } from 'react';

interface Screen2ResearchLoadingProps {
  project: any;
}

export default function Screen2ResearchLoading({ project }: Screen2ResearchLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Searching for relevant sources...',
    'Analyzing sentiment and trends...',
    'Extracting key insights...',
    'Generating headline options...',
  ];

  useEffect(() => {
    // Simulate research progress over time
    const totalDuration = 8000; // 8 seconds
    const steps = 4;
    const stepDuration = totalDuration / steps;

    const intervals = steps;
    let currentStep = 0;

    const stepInterval = setInterval(() => {
      if (currentStep < intervals) {
        setCurrentStep(currentStep);
        setProgress((currentStep / intervals) * 100);
        currentStep++;
      } else {
        clearInterval(stepInterval);
      }
    }, stepDuration);

    return () => clearInterval(stepInterval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Headline */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Researching your topic</h2>
        <p className="text-gray-600 mt-2">Finding the best sources and insights...</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">{Math.round(progress)}%</p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                index < currentStep
                  ? 'bg-orange-500 text-white'
                  : index === currentStep
                    ? 'bg-orange-200 text-orange-700'
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index < currentStep ? '✓' : index === currentStep ? '•' : '○'}
            </div>
            <p
              className={`transition-colors ${
                index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
              }`}
            >
              {step}
            </p>
          </div>
        ))}
      </div>

      {/* Loading Animation */}
      <div className="flex justify-center pt-8">
        <div className="space-y-2">
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-orange-400 rounded-full"
                style={{
                  animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          30% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
