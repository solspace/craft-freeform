import { easings } from '@ff-welcome-screen/shared/styles/animations';
import styled from 'styled-components';
import { animated } from 'react-spring';

export const Wrapper = styled.div``;

interface StepContainerProps {
  height: number;
}
export const StepContainer = styled.div<StepContainerProps>`
  height: ${({ height }): number => height}px;
  padding: 0 40px;

  transition: all 0.2s ease-out;
`;

export const Step = styled(animated.div)`
  position: absolute;
  left: 0;
  right: 0;
  top: 24px;

  max-width: 1000px;
  margin: 0 auto;
`;

export const NavigationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 40px;

  opacity: 1;
  transform: translateY(0);
  transition: all 500ms ${easings.out.quart};

  &.animation {
    &-appear {
      opacity: 0;
      transform: translateY(30px);
    }
  }
`;
