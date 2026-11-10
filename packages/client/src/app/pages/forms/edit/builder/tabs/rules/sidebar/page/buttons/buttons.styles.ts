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
  background-color: light-dark(rgba(96, 125, 159, 0.25), var(--ui-control-bg-color));

  font-size: 12px;
  line-height: 12px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  transition: background-color 0.2s ease-out;

  &.active {
    background-color: light-dark(${colors.gray600}, var(--bg-selection-dark));
    color: light-dark(white, ${colors.text});
  }

  &:hover:not(.active) {
    background-color: light-dark(rgba(96, 125, 159, 0.3), var(--ui-control-hover-bg-color));
  }

  &.submit {
    background-color: light-dark(${colors.gray600}, var(--bg-selection-dark));
    color: light-dark(${colors.white}, ${colors.text});

    &.active {
      background-color: light-dark(${colors.gray900}, var(--ui-control-active-bg-color));
    }

    &:hover:not(.active) {
      background-color: light-dark(${colors.gray900}, var(--ui-control-active-bg-color));
    }
  }

  &.has-rule {
    border-color: ${colors.teal550};
  }
`;
