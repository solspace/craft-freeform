import { animated } from "@react-spring/web";
import styled from "styled-components";

export const DuplicateButtonWrapper = styled(animated.button)`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 20px;
  height: 20px;

  font-size: 16px;

  border-radius: 50%;
  padding: 3px;

  svg {
    color: currentColor;
  }
`;
