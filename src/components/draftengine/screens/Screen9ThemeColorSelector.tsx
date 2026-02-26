'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/lib/convex-client';

interface Screen9Props {
  project: any;
  workflow: any;
  steps: any[];
  onNext?: () => void;
}

const THEMES = [
  { id: 'minimal', label: 'Minimal', icon: '⬜' },
  { id: 'classic', label: 'Classic', icon: '📖' },
  { id: 'modern', label: 'Modern', icon: '⚡' },
  { id: 'bold', label: 'Bold', icon: '🔥' },
  { id: 'elegant', label: 'Elegant', icon: '✨' },
  { id: 'playful', label: 'Playful', icon: '🎨' },
];

const PALETTES = [
  { id: 'navy', label: 'Navy', color: '#001f3f' },
  { id: 'teal', label: 'Teal', color: '#17a2b8' },
  { id: 'forest', label: 'Forest', color: '#28a745' },
  { id: 'sunset', label: 'Sunset', color: '#ff6b6b' },
  { id: 'purple', label: 'Purple', color: '#6f42c1' },
  { id: 'gold', label: 'Gold', color: '#ffc107' },
  { id: 'slate', label: 'Slate', color: '#6c757d' },
  { id: 'rose', label: 'Rose', color: '#e83e8c' },
];

export default function Screen9ThemeColorSelector({
  project,
  workflow,
  steps,
  onNext,
}: Screen9Props) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const approveStep = useMutation(api.workflows.approveStepFromUI);
  const updateDraftEngineProject = useMutation(api.draftengine.updateProject);

  const handleApprove = async () => {
    if (!selectedTheme || !selectedPalette) {
      alert('Please select both a theme and a colour palette');
      return;
    }

    setIsApproving(true);
    try {
      // Find the theme selection step (Step 10: agentRole "none")
      const step10 = steps.find(
        (s) => s.stepNumber === 10 && s.agentRole === 'none'
      );
      if (!step10) throw new Error('Theme selection step not found');

      const selectedPaletteObj = PALETTES.find((p) => p.id === selectedPalette);
      const accentColor = selectedPaletteObj?.color || '#001f3f';

      // Update project with selections
      await updateDraftEngineProject({
        projectId: project._id,
        updates: {
          themeId: selectedTheme,
          paletteName: selectedPalette,
          accentColor,
        },
      });

      // Approve the step
      await approveStep({
        stepId: step10._id,
        reviewNotes: `Selected theme: ${selectedTheme}, palette: ${selectedPalette}`,
      });

      onNext?.();
    } catch (error) {
      console.error('Failed to approve theme:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Customize Your Blog Design
        </h2>
        <p className="text-gray-600">
          Choose a theme and accent colour
        </p>
      </div>

      {/* Themes */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`p-4 rounded-lg border-2 transition text-center ${
                selectedTheme === theme.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="text-3xl mb-2">{theme.icon}</div>
              <div className="text-sm font-medium text-gray-900">
                {theme.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Colour Palettes */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Accent Colour
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {PALETTES.map((palette) => (
            <button
              key={palette.id}
              onClick={() => setSelectedPalette(palette.id)}
              className={`p-4 rounded-lg border-2 transition ${
                selectedPalette === palette.id
                  ? 'border-gray-900'
                  : 'border-gray-300 hover:border-gray-600'
              }`}
            >
              <div
                className="w-12 h-12 rounded-lg mx-auto mb-2"
                style={{ backgroundColor: palette.color }}
              />
              <div className="text-xs font-medium text-gray-900 text-center">
                {palette.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-auto">
        <button
          onClick={() => {
            setSelectedTheme(null);
            setSelectedPalette(null);
          }}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleApprove}
          disabled={!selectedTheme || !selectedPalette || isApproving}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApproving ? 'Generating...' : 'Generate Preview'}
        </button>
      </div>
    </div>
  );
}
