import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const NewTabWrapper = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.muted};
  border-radius: 4px;

  padding: 0 10px;

  transition: color 0.15s ease-out, background-color 0.15s ease-out;

  &:focus {
    outline: none;
  }

  &:hover {
    color: ${colors.text};
    background-color: var(--ui-control-hover-bg-color, ${colors.gray050});
  }

  &:focus-visible {
    box-shadow: var(--focus-ring-inner);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;
