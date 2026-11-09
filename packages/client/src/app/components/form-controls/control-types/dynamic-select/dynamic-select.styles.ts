import { animations } from "@ff-client/styles/animations";
import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const DropdownContainer = styled.div`
  display: grid;
  grid-template-columns: auto 40px;
  gap: 5px;
`;

export const RefreshButton = styled.button`
  padding: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text};
  background-color: var(--button-bg, #dfe5ec);

  &:not(:disabled):hover { background-color: var(--button-bg--hover, #cdd4de); }

  svg {
    width: 20px;
    height: 20px;
  }

  &[disabled] {
    background-color: var(--ui-control-static-bg-color, #eef2f8);
    color: ${colors.muted};

    svg {
      fill: ${colors.muted};

      animation: ${animations.spinner} 2s infinite;
      transform-origin: 50% 50%;
    }
  }
`;
