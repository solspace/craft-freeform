import { textControl } from "@ff-client/styles/craft6";
import styled from "styled-components";

export const InlineSelect = styled.span`
  display: inline-flex;
  position: relative;
  vertical-align: middle;
  flex-shrink: 0;

  select {
    ${textControl};
    appearance: none;
    height: var(--c-size-control-md);
    padding-inline-end: calc(var(--c-input-spacing-inline) + 1em);
    cursor: pointer;
  }

  &::after {
    content: '';
    position: absolute;
    inset-inline-end: var(--c-input-spacing-inline);
    top: calc(50% - 4px);
    width: 6px;
    height: 6px;
    border: solid currentColor;
    border-width: 0 1.5px 1.5px 0;
    transform: rotate(45deg);
    pointer-events: none;
  }
`;
