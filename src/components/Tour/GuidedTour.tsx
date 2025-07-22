import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';

const tourSteps: Step[] = [
  {
    target: '.tour-sidebar',
    content: 'Welcome to AgriERP! This is your navigation sidebar. Navigate between different modules like Products, Orders, and Reports.',
    placement: 'right',
  },
  {
    target: '.tour-dashboard',
    content: 'Your dashboard shows key metrics and quick actions. Monitor your business performance at a glance.',
    placement: 'bottom',
  },
  {
    target: '.tour-theme-toggle',
    content: 'Switch between light and dark modes for comfortable viewing.',
    placement: 'bottom',
  },
  {
    target: '.tour-notifications',
    content: 'Check your notifications for order updates, stock alerts, and more.',
    placement: 'bottom',
  },
  {
    target: '.tour-profile',
    content: 'Access your profile, settings, and logout from here.',
    placement: 'bottom-start',
  },
  {
    target: '.tour-products',
    content: 'Manage your agriculture products - seeds, fertilizers, pesticides, and equipment.',
    placement: 'right',
  },
  {
    target: '.tour-orders',
    content: 'Process customer orders, generate bills, and track deliveries.',
    placement: 'right',
  },
  {
    target: '.tour-reports',
    content: 'Generate detailed reports with advanced filtering for all modules.',
    placement: 'right',
  },
];

export const GuidedTour: React.FC = () => {
  const [runTour, setRunTour] = useState(false);
  const { authState } = useAuth();

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem(`tour-seen-${authState.user?.email}`);
    if (!hasSeenTour && authState.isAuthenticated) {
      // Delay tour start to ensure DOM is ready
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [authState.isAuthenticated, authState.user?.email]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem(`tour-seen-${authState.user?.email}`, 'true');
    }
  };

  const restartTour = () => {
    setRunTour(true);
  };

  // Expose restart function globally for manual tour restart
  useEffect(() => {
    (window as any).startAgriTour = restartTour;
  }, []);

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <Joyride
      steps={tourSteps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(120, 65%, 40%)',
          backgroundColor: 'hsl(var(--surface))',
          textColor: 'hsl(var(--foreground))',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          arrowColor: 'hsl(var(--surface))',
          zIndex: 10000,
        },
        tooltip: {
          backgroundColor: 'hsl(var(--surface))',
          color: 'hsl(var(--foreground))',
          fontSize: '14px',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid hsl(var(--border))',
        },
        tooltipContainer: {
          textAlign: 'left' as const,
        },
        buttonNext: {
          backgroundColor: 'hsl(120, 65%, 40%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '600',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginLeft: '8px',
          marginRight: '8px',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
        spotlight: {
          borderRadius: '8px',
        },
      }}
      locale={{
        back: 'Previous',
        close: 'Close',
        last: 'Finish Tour',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};