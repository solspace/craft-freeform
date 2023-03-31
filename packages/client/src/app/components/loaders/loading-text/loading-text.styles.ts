import styled, { keyframes } from 'styled-components';

export const LoadingTextWrapper = styled.span`
  display: flex;
  align-items: center;

  svg {
    width: 1.5em;
    height: 1.5em;

    padding-right: 5px;

    fill: currentColor;
  }
`;

const pulseAnimation = keyframes`
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

export const Dot = styled.span`
  animation-name: ${pulseAnimation};
  animation-duration: 1.5s;
  animation-iteration-count: infinite;

  &:nth-child(2) {
    animation-delay: 0.3s;
  }

  &:nth-child(3) {
    animation-delay: 0.6s;
  }

  &:nth-child(4) {
    animation-delay: 0.9s;
  }

  &:after {
    content: '.';
  }
`;
