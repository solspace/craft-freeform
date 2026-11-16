import { colors } from "@ff-client/styles/variables";
import { animated } from "@react-spring/web";
import styled from "styled-components";

export const RemoveButtonWrapper = styled(animated.button)`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 20px;
  height: 20px;
  box-sizing: border-box;
  flex-shrink: 0;

  font-size: 16px;

  border-radius: 50%;
  border: none;
  padding: 3px;
  background-color: transparent;
  color: light-dark(${colors.gray300}, ${colors.muted});
  scale: 1;
  transition: background-color 120ms ease-out, color 120ms ease-out, scale 120ms ease-out;

  &:hover {
    background-color: light-dark(${colors.error}, var(--bg-error));
    color: light-dark(#fff, ${colors.error});
    scale: 1.2;
  }

  &:focus-visible {
    opacity: 1 !important;
    transform: none !important;
    outline: 2px solid ${colors.error};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) { transition: none; }

  svg {
    display: block;
    width: 100%;
    height: 100%;
    color: currentColor;
  }
`;
