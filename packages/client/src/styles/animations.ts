import { keyframes } from 'styled-components';

export const animations = {
  spinner: keyframes`
    0% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(.55, .055, .675, .19);
    }
    100% {
      transform: rotate(360deg);
    }
  `,
};
