'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/lib/convex-client';
import ErrorBoundary from '@/components/draftengine/ErrorBoundary';
import WizardShell from '@/components/draftengine/WizardShell';
import Screen1TopicInput from '@/components/draftengine/screens/Screen1TopicInput';
import Screen2ResearchLoading from '@/components/draftengine/screens/Screen2ResearchLoading';
import Screen3HeadlineSelection from '@/components/draftengine/screens/Screen3HeadlineSelection';
import Screen4HeadlineApproval from '@/components/draftengine/screens/Screen4HeadlineApproval';
import Screen5ImageStyleSelector from '@/components/draftengine/screens/Screen5ImageStyleSelector';
import Screen6WritingImageLoading from '@/components/draftengine/screens/Screen6WritingImageLoading';
import Screen7BlogReview from '@/components/draftengine/screens/Screen7BlogReview';
import Screen8ImageReview from '@/components/draftengine/screens/Screen8ImageReview';
import Screen9ThemeColorSelector from '@/components/draftengine/screens/Screen9ThemeColorSelector';
import Screen10FinalPreview from '@/components/draftengine/screens/Screen10FinalPreview';

const SCREENS = [
  Screen1TopicInput,              // Screen 0: Topic input
  Screen2ResearchLoading,         // Screen 1: Research loading (steps 1-3)
  Screen3HeadlineSelection,       // Screen 2: Headline selection (step 3 output preview)
  Screen4HeadlineApproval,        // Screen 3: Headline approval gate (step 4)
  Screen5ImageStyleSelector,      // Screen 4: Image style selection (step 5)
  Screen6WritingImageLoading,     // Screen 5: Writing + image generation (steps 6-7)
  Screen7BlogReview,              // Screen 6: Blog review gate (step 8)
  Screen8ImageReview,             // Screen 7: Image review (step 9)
  Screen9ThemeColorSelector,      // Screen 8: Theme + colour selector (step 10)
  Screen10FinalPreview,           // Screen 9: Final preview + download (step 11+)
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

  if (!project) {
    return <div className="flex items-center justify-center min-h-screen">Loading project...</div>;
  }

  if (!workflowData) {
    return <div className="flex items-center justify-center min-h-screen">Loading workflow...</div>;
  }

  const workflow = workflowData.workflow;
  const steps = workflowData.steps || [];

  if (!workflow) {
    return <div className="flex items-center justify-center min-h-screen">Workflow not found...</div>;
  }

  // Derive screen purely from currentStepNumber
  // Maps workflow step numbers to screen indices
  const deriveScreen = (): number => {
    const stepNum = workflow?.currentStepNumber || 1;
    
    // Step 1-3: Research phases (trend + news analysis running) → Research Loading (Screen 1)
    if (stepNum >= 1 && stepNum <= 3) return 1;
    
    // Step 4: Headline generation → Headline Approval Gate (Screen 3)
    if (stepNum === 4) return 3;
    
    // Step 5: Image style selection → Image Style Selector (Screen 4)
    if (stepNum === 5) return 4;
    
    // Steps 6-7: Blog writing + Image generation (parallel) → Loading (Screen 5)
    if (stepNum >= 6 && stepNum <= 7) return 5;
    
    // Step 8: Blog review → Blog Review (Screen 6)
    if (stepNum === 8) return 6;
    
    // Step 9: Image review → Image Review (Screen 7, placeholder)
    if (stepNum === 9) return 7;
    
    // Step 10: Theme selection → Theme Selector (Screen 8, placeholder)
    if (stepNum === 10) return 8;
    
    // Step 11-12: Final preview → Preview (Screen 9, placeholder)
    if (stepNum >= 11 && stepNum <= 12) return 9;
    
    // Step 13+: Complete or beyond
    if (stepNum >= 13) return 9;

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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
