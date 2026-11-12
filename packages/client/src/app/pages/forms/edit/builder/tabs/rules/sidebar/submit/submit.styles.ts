import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const SubmitFormWrapper = styled.button.attrs({ type: "button" })`
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: ${spacings.sm};

  min-height: var(--c-size-control-md);
  padding: var(--c-spacing-md) var(--c-spacing-lg);
  text-align: start;
  color: var(--c-text-default);

  > div {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  border: 1px solid light-dark(#cdd8e4, ${colors.border});
  background-color: var(--c-surface-default);

  border-radius: ${borderRadius.md};

  transition: all 0.2s ease-out;

  &.has-rule {
    border-color: var(--border-success);
    background-color: light-dark(${colors.teal050}, var(--bg-success));
  }

  &.active {
    background-color: light-dark(${colors.gray500}, var(--bg-selection-dark));
    border-color: ${colors.border};

    color: white;
    fill: currentColor;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const Label = styled.label`
  cursor: pointer;

  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
