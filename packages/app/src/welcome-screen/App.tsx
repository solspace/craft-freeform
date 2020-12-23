import React, { ReactElement, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { NavigationWrapper, Step, StepContainer, Wrapper } from './App.styles';
import ButtonCollection, { Button } from './shared/components/ButtonCollection/ButtonCollection';
import Dots from './shared/components/Dots/Dots';
import Finalize from './Steps/Finalize/Finalize';
import General from './Steps/General/General';
import Reliability from './Steps/Reliability/Reliability';
import Spam from './Steps/Spam/Spam';
import Welcome from './Steps/Welcome/Welcome';

const duration = 300;

const App: React.FC = () => {
  const [step, setStep] = useState(0);

  const views: ReactElement[] = [
    <Welcome key="welcome" />,
    <General key="general" />,
    <Spam key="spam" />,
    <Reliability key="reliability" />,
    <Finalize key="finalize" />,
  ];

  const next = (): void => setStep(step + 1);
  const prev = (): void => setStep(step - 1);

  const buttons: Button[][] = [
    [{ label: 'Skip All' }, { label: 'Continue', cta: true, onClick: next }],
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
      { label: 'Dashboard', onClick: prev },
      { label: 'Settings' },
      { label: 'Install Demo Templates' },
      { label: 'Close Wizard', cta: true, onClick: next },
    ],
  ];

  return (
    <Wrapper>
      <StepContainer>
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
          <ButtonCollection step={step} buttons={buttons}>
            <button className="btn">Test</button>
          </ButtonCollection>
          <Dots step={step} count={views.length} />
        </NavigationWrapper>
      </CSSTransition>
    </Wrapper>
  );
};

export default App;
