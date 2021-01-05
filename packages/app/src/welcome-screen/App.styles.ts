import { easings } from '@ff-welcome-screen/shared/styles/animations';
import styled from 'styled-components';

export const Wrapper = styled.div``;

interface StepContainerProps {
  height: number;
}
export const StepContainer = styled.div<StepContainerProps>`
  height: ${({ height }): number => height}px;
  padding: 0 40px;

  transition: all 0.2s ease-out;
`;

export const Step = styled.div`
  max-width: 1000px;
  margin: 0 auto;

  opacity: 1;
  transform: translateX(0);

  transition: all 500ms ${easings.out.default};

  &.animation {
    &-enter,
    &-appear {
      opacity: 0;
      transform: translateX(20%);
    }

    &-exit {
      position: absolute;
      top: 24px;
      left: 0;
      right: 0;

      transition: all 500ms ${easings.out.default};

      &-active {
        opacity: 0;
        transform: translateX(-20%);
      }
    }
  }
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
