import styled from "styled-components";

import {
  Button,
  Cell,
  Input,
  TableContainer,
  TableEditorWrapper,
  TabularOptions,
} from "../table/table.editor.styles";

export const CompactEditor = styled(TableEditorWrapper)`
  gap: var(--c-spacing-sm, 8px);
  min-width: 0;

  ${TableContainer} { border-radius: 0; }
  ${TabularOptions} {
    table-layout: fixed;
    border-collapse: collapse;
    thead {
      background: transparent;
      border: 0;
      th {
        background: transparent;
        border: 0;
        border-bottom: 2px solid var(--c-color-neutral-border-normal);
        padding: 8px 9px;
        font-size: 12px;
        text-align: start;
      }
    }
  }
  .empty-state {
    padding: 14px 9px;
    color: var(--c-text-light);
    background: var(--c-color-neutral-fill-quiet);
    border-bottom: 1px solid var(--c-color-neutral-border-quiet);
  }
  ${Cell} { border-color: var(--c-color-neutral-border-quiet); }
  ${Button} {
    appearance: none;
    border: 0;
    border-radius: var(--c-form-control-radius);
    background: transparent;
    color: var(--c-text-light);
    width: 24px;
    height: 24px;
    &:hover:not(:disabled) { background: var(--c-color-neutral-fill-normal); color: var(--c-text-default); }
    &:disabled { opacity: 0.4; cursor: default; }
    &:focus-visible { outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline); }
  }
  ${Input} {
    height: 38px;
    border: 0;
    border-radius: 0;
    font: inherit;
    color: var(--c-text-default);
  }
  && > .btn {
    align-self: start;
    width: auto;
    border: 1px solid transparent;
    background: transparent;
    color: var(--c-text-default);
    box-shadow: none;
  }
  && > .btn:hover:not(:disabled) { background: var(--c-color-neutral-fill-normal); }
  && > .btn:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: var(--c-focus-outline-offset);
  }
`;
