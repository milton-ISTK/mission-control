'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/lib/convex-client';
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
  
  // Fetch project directly from Convex
  const project = useQuery(api.draftengine.getProject, projectId ? { projectId: projectId as any } : 'skip');

  if (!project) {
    return <div className="flex items-center justify-center min-h-screen">Loading project...</div>;
  }

  // Map current screen based on project state
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
  
  const displayScreen = screenMap[project.currentScreen] || currentScreen;

  const CurrentScreen = SCREENS[displayScreen];

  const handleNextScreen = (data?: any) => {
    if (displayScreen < SCREENS.length - 1) {
      setCurrentScreen(displayScreen + 1);
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
      currentScreen={displayScreen + 1}
      totalScreens={SCREENS.length}
      onPrevious={handlePreviousScreen}
      onExit={handleExit}
      canGoPrevious={displayScreen > 0}
    >
      <CurrentScreen
        project={project}
        onNext={handleNextScreen}
      />
    </WizardShell>
  );
}
