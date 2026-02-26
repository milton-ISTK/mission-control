'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import WizardShell from '@/components/draftengine/WizardShell';
import Screen1TopicInput from '@/components/draftengine/screens/Screen1TopicInput';
import Screen2ResearchLoading from '@/components/draftengine/screens/Screen2ResearchLoading';
import Screen3HeadlineSelection from '@/components/draftengine/screens/Screen3HeadlineSelection';
// Screens 4-10 coming in next commits

const SCREENS = [
  Screen1TopicInput,
  Screen2ResearchLoading,
  Screen3HeadlineSelection,
  // Placeholder screens to prevent errors (will be replaced)
  Screen1TopicInput,
  Screen1TopicInput,
  Screen1TopicInput,
  Screen1TopicInput,
  Screen1TopicInput,
  Screen1TopicInput,
  Screen1TopicInput,
];

export default function WizardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || '';

  const [currentScreen, setCurrentScreen] = useState(0);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load project on mount
  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await fetch(`/api/draftengine/project/${projectId}`);
        if (!response.ok) throw new Error('Project not found');
        const data = await response.json();
        setProject(data);
        // Determine current screen based on project state
        const screenMap: { [key: string]: number } = {
          topic_input: 0,
          researching: 1,
          headline_select: 2,
          image_style: 3,
          creating: 4,
          blog_review: 5,
          image_review: 6,
          theme_select: 7,
          preview: 8,
          complete: 9,
        };
        setCurrentScreen(screenMap[data.currentScreen] || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const CurrentScreen = SCREENS[currentScreen];

  const handleNextScreen = (data?: any) => {
    if (currentScreen < SCREENS.length - 1) {
      setCurrentScreen(currentScreen + 1);
      if (data) {
        setProject({ ...project, ...data });
      }
    }
  };

  const handlePreviousScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleExit = () => {
    if (confirm('Are you sure? Your progress will be saved.')) {
      router.push('/draftengine');
    }
  };

  return (
    <WizardShell
      currentScreen={currentScreen + 1}
      totalScreens={SCREENS.length}
      onPrevious={handlePreviousScreen}
      onExit={handleExit}
      canGoPrevious={currentScreen > 0}
    >
      <CurrentScreen
        project={project}
        onNext={handleNextScreen}
      />
    </WizardShell>
  );
}
