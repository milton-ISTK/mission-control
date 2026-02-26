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

  // Derive screen from workflow state
  // Map currentStepNumber + step status to screen index
  const deriveScreen = (): number => {
    const stepNum = workflow.currentStepNumber;
    const currentStep = steps.find((s) => s.stepNumber === stepNum);

    if (stepNum >= 1 && stepNum <= 3 && currentStep?.status === 'pending') {
      return 1; // Research loading (steps 1-3 are processing)
    }
    if (stepNum === 4 && (currentStep?.status === 'awaiting_review' || currentStep?.status === 'completed')) {
      return 2; // Headline selection (step 4 done, awaiting review)
    }
    if (stepNum === 5 && (currentStep?.status === 'awaiting_review' || currentStep?.status === 'completed')) {
      return 3; // Image style (step 5 done)
    }
    if (stepNum >= 6 && stepNum <= 7 && currentStep?.status === 'pending') {
      return 4; // Writing loading (steps 6-7 processing)
    }
    if (stepNum === 8 && (currentStep?.status === 'awaiting_review' || currentStep?.status === 'completed')) {
      return 5; // Blog review
    }
    if (stepNum === 9 && (currentStep?.status === 'awaiting_review' || currentStep?.status === 'completed')) {
      return 6; // Image review
    }
    if (stepNum === 10 && (currentStep?.status === 'awaiting_review' || currentStep?.status === 'completed')) {
      return 7; // Theme selection
    }
    if (stepNum === 11 && (currentStep?.status === 'awaiting_review' || currentStep?.status === 'completed')) {
      return 8; // Final preview
    }
    if (stepNum === 12 && currentStep?.status === 'completed') {
      return 9; // Complete
    }

    return 1; // Default to research loading while processing
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
