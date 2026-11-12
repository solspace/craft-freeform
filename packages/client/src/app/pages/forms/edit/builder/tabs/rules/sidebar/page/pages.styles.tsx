import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

import { Button } from "./buttons/buttons.styles";

export const PageWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

export const PageButton = styled.button.attrs({ type: "button" })`
  position: relative;
  bottom: -1px;
  z-index: 1;

  display: inline-flex;
  justify-content: start;
  align-items: center;
  flex-wrap: nowrap;
  gap: ${spacings.sm};

  max-width: 150px;
  min-height: var(--c-size-control-md);
  padding: var(--c-spacing-md) var(--c-spacing-lg);

  background-color: var(--c-surface-default);

  border: 1px solid var(--c-color-neutral-border-quiet);
  border-bottom: none;
  border-radius: ${borderRadius.md} ${borderRadius.md} 0 0;

  text-align: left;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  transition: all 0.2s ease-out;

  &.has-rule {
    border-color: var(--border-success);
    background-color: light-dark(${colors.teal050}, var(--bg-success));

    &.active {
      border-right-color: ${colors.teal700};
    }
  }

  &.active {
    background-color: light-dark(${colors.gray500}, var(--bg-selection-dark));
    border-color: ${colors.border};
    color: ${colors.white};
  }

  &,
  &:active,
  &:focus {
    outline: none;
  }

  &.read-only {
    cursor: default !important;
  }

  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`;

export const PageBody = styled.div`
  padding: ${spacings.sm};
  border: 1px solid var(--c-color-neutral-border-quiet);
  background-color: var(--c-surface-default);

  border-radius: 0 ${borderRadius.md} ${borderRadius.md} ${borderRadius.md};

  transition: all 0.2s ease-out;

  &.has-rule {
    border-color: var(--border-success);
    background-color: light-dark(${colors.teal050}, var(--bg-success));
  }

  &.active {
    background-color: light-dark(${colors.gray500}, var(--bg-selection-dark));
    border-color: ${colors.border};

    ${Button} {
      background-color: ${colors.gray100};

      &.submit {
        background-color: ${colors.red600};
      }
    }
  }
`;

export const PageIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const PageLabel = styled.label`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
