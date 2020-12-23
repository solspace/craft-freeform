import styled from 'styled-components';
import { easings } from '../../styles/animations';

export const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const loopTransitionDelay = (): string => {
  let rule = '';

  for (let index = 0; index <= 5; index++) {
    rule += `
      &:nth-child(${index + 1}) {
        transition-delay: ${index * 50}ms;
      }
    `;
  }

  return rule;
};

const range = 20;
export const ButtonRow = styled.div`
  position: relative;

  display: flex;
  width: 100%;
  justify-content: center;

  > button {
    margin: 0 5px;

    transition: all 300ms ${easings.out.default};

    ${loopTransitionDelay()}
  }

  &.animation {
    &-enter {
      button {
        opacity: 0;
        transform: translateY(${range}px);
      }

      &-active {
        button {
          opacity: 1;
          transform: translateY(0px);
        }
      }
    }

    &-exit {
      position: absolute;
      top: 0;
      user-select: none;
      pointer-events: none;

      button {
        opacity: 1;
      }

      &-active {
        button {
          opacity: 0;
        }
      }
    }
  }
`;
