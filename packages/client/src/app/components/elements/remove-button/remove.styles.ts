import { colors } from "@ff-client/styles/variables";
import { animated } from "@react-spring/web";
import styled from "styled-components";

export const RemoveButtonWrapper = styled(animated.button)`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 20px;
  height: 20px;

  font-size: 16px;

  border: 0;
  border-radius: 50%;
  padding: 3px;
  background-color: transparent;
  color: ${colors.gray300};
  scale: 1;
  transition: background-color 120ms ease-out, color 120ms ease-out, scale 120ms ease-out;

  &:hover {
    background-color: ${colors.error};
    color: #fff;
  }

  @media (prefers-reduced-motion: reduce) { transition: none; }

  svg {
    color: currentColor;
  }
`;
