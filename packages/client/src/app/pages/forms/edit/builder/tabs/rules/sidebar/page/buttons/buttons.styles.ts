import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  margin-top: ${spacings.md};
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacings.xs};
`;

export const Button = styled.button`
  flex: 1 1;

  height: 22px;
  max-width: 60px;
  padding: 0 ${spacings.sm};

  border: 2px solid transparent;
  border-radius: ${borderRadius.lg};
  background-color: var(--ui-control-bg-color);

  font-size: 12px;
  line-height: 12px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  transition: background-color 0.2s ease-out;

  &.active {
    background-color: var(--bg-selection-dark);
    color: ${colors.text};
  }

  &:hover:not(.active) {
    background-color: var(--ui-control-hover-bg-color);
  }

  &.submit {
    background-color: var(--bg-selection-dark);
    color: ${colors.text};

    &.active {
      background-color: var(--ui-control-active-bg-color);
    }

    &:hover:not(.active) {
      background-color: var(--ui-control-active-bg-color);
    }
  }

  &.has-rule {
    border-color: ${colors.teal550};
  }
`;
