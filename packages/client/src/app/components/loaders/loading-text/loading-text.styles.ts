import { animated } from 'react-spring';
import styled, { keyframes } from 'styled-components';

export const LoadingTextWrapper = styled.span`
  display: inline-flex;

  svg {
    width: 1.5em;
    height: 1.5em;

    padding-right: 5px;

    fill: currentColor;
  }
`;

export const TextContainer = styled(animated.span)`
  position: relative;

  overflow: hidden;
  transform-origin: center center;
`;

const TextBlock = styled(animated.span)`
  position: absolute;
  left: 0;
  top: 0;

  opacity: 0;
  white-space: nowrap;
`;

export const OriginalTextContainer = styled(TextBlock)`
  transform: translateY(0px);
  opacity: 1;
`;
export const LoadingTextContainer = styled(TextBlock)``;

export const SpinnerContainer = styled(animated.span)`
  overflow: hidden;
  transform-origin: center right;
`;

export const DotContainer = styled(animated.span)`
  white-space: nowrap;
  overflow: hidden;
  transform-origin: center left;
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
