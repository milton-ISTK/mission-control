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
  
  // Fetch project to get workflow ID
  const project = useQuery(api.draftengine.getProject, projectId ? { projectId: projectId as any } : 'skip');

  // Fetch workflow + all steps (real-time subscription)
  const workflowData = useQuery(
    api.workflows.getWorkflowWithSteps,
    project?.workflowId ? { workflowId: project.workflowId } : 'skip'
  );

  if (!project || !workflowData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const { workflow, steps } = workflowData;

  // Derive screen purely from currentStepNumber
  // No status checking - just follow the workflow progress
  const deriveScreen = (): number => {
    const stepNum = workflow.currentStepNumber;
    
    // Step mapping: currentStepNumber → screen index
    // Steps 1-3: research (show loading)
    if (stepNum >= 1 && stepNum <= 3) return 1;
    
    // Step 4: headlines (show selection once step 4 is reached)
    if (stepNum === 4) return 2;
    
    // Step 5: image style
    if (stepNum === 5) return 3;
    
    // Steps 6-7: writing/image generation (show loading)
    if (stepNum >= 6 && stepNum <= 7) return 4;
    
    // Step 8: blog review
    if (stepNum === 8) return 5;
    
    // Step 9: image review
    if (stepNum === 9) return 6;
    
    // Step 10: theme selection
    if (stepNum === 10) return 7;
    
    // Step 11: final preview
    if (stepNum === 11) return 8;
    
    // Step 12+: complete
    if (stepNum >= 12) return 9;

    return 1; // Default
  };

  const displayScreen = deriveScreen();

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
        workflow={workflow}
        steps={steps}
        onNext={handleNextScreen}
      />
    </WizardShell>
  );
}
