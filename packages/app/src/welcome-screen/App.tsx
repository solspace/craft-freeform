import React, { ReactElement, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { NavigationWrapper, Step, StepContainer, Wrapper } from './App.styles';
import ButtonCollection, { Button } from './shared/components/ButtonCollection/ButtonCollection';
import Dots from './shared/components/Dots/Dots';
import { generateUrl } from './shared/requests/generate-url';
import Finalize from './Steps/Finalize/Finalize';
import General from './Steps/General/General';
import Reliability from './Steps/Reliability/Reliability';
import Spam from './Steps/Spam/Spam';
import Welcome from './Steps/Welcome/Welcome';

const duration = 500;

const App: React.FC = () => {
  const [step, setStep] = useState(0);
  const [finalized, setFinalized] = useState(false);
  const [containerHeight, setContainerHeight] = useState(300);

  const views: ReactElement[] = [
    <Welcome key="welcome" />,
    <General key="general" />,
    <Spam key="spam" />,
    <Reliability key="reliability" />,
    <Finalize
      key="finalize"
      successCallback={(): void => {
        setFinalized(true);
      }}
    />,
  ];

  const updateContainerHeight = (nextStep: number): void => {
    let height = 300;
    if (nextStep > 0 && nextStep < 4) {
      height = 640;
    } else if (nextStep >= 4) {
      height = 400;
    }

    setContainerHeight(height);
  };

  const next = (): void => {
    setStep(step + 1);
    updateContainerHeight(step + 1);
  };

  const prev = (): void => {
    setStep(step - 1);
    updateContainerHeight(step - 1);
  };

  const buttons: Button[][] = [
    [
      {
        label: 'Skip All',
        onClick: (): void => {
          window.location.href = generateUrl('/dashboard');
        },
      },
      { label: 'Continue', cta: true, onClick: next },
    ],
    [{ label: 'Next', cta: true, onClick: next }],
    [
      { label: 'Back', onClick: prev },
      { label: 'Next', cta: true, onClick: next },
    ],
    [
      { label: 'Back', onClick: prev },
      { label: 'Finish', cta: true, onClick: next },
    ],
    [
      {
        label: 'Settings',
        disabled: !finalized,
        onClick: (): void => {
          window.location.href = generateUrl('/settings');
        },
      },
      {
        label: 'Install Demo Templates',
        disabled: !finalized,
        onClick: (): void => {
          window.location.href = generateUrl('/settings/demo-templates');
        },
      },
      {
        label: 'Close Wizard',
        disabled: !finalized,
        cta: true,
        onClick: (): void => {
          window.location.href = generateUrl('/dashboard');
        },
      },
    ],
  ];

  return (
    <Wrapper>
      <StepContainer height={containerHeight}>
        {views.map((view, idx) => (
          <CSSTransition
            unmountOnExit
            appear={idx === 0}
            in={step === idx}
            key={idx}
            timeout={duration}
            classNames="animation"
          >
            <Step>{view}</Step>
          </CSSTransition>
        ))}
      </StepContainer>

      <CSSTransition appear in timeout={500} classNames="animation">
        <NavigationWrapper>
          <ButtonCollection step={step} buttons={buttons} />
          <Dots step={step} count={views.length} />
        </NavigationWrapper>
      </CSSTransition>
    </Wrapper>
  );
};

export default App;
