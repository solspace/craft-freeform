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
  gap: 8px;
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
        border-bottom: 2px solid var(--gray-300, #a6b4c9);
        padding: 8px 9px;
        font-size: 12px;
        text-align: start;
      }
    }
  }
  .empty-state {
    padding: 14px 9px;
    color: var(--gray-500, #606d7b);
    background: var(--gray-050, #f3f7fc);
    border-bottom: 1px solid var(--border-hairline, rgba(51, 64, 77, .1));
  }
  ${Cell} { border-color: var(--border-hairline, rgba(51, 64, 77, .1)); }
  ${Button} {
    appearance: none;
    border: 0;
    border-radius: var(--radius-lg, 5px);
    background: transparent;
    color: var(--gray-500, #606d7b);
    width: 24px;
    height: 24px;
    &:hover:not(:disabled) { background: var(--gray-100, #e4edf6); color: var(--gray-800, #33404d); }
    &:disabled { opacity: 0.4; cursor: default; }
    &:focus-visible { outline: 2px solid var(--blue-500, #0d99f2); }
  }
  ${Input} {
    height: 38px;
    border: 0;
    border-radius: 0;
    font: inherit;
    color: var(--gray-800, #33404d);
  }
  && > .btn {
    align-self: start;
    width: auto;
    border: 1px solid transparent;
    background: transparent;
    color: var(--gray-800, #33404d);
    box-shadow: none;
  }
  && > .btn:hover:not(:disabled) { background: var(--gray-100, #e4edf6); }
  && > .btn:focus-visible {
    outline: 2px solid var(--blue-500, #0d99f2);
    outline-offset: 2px;
  }
`;
