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

  ${TableContainer} {
    max-height: none;
    overflow: hidden;
    border: 1px solid var(--border-hairline, rgba(51, 64, 77, .1));
    border-radius: var(--radius-lg, 5px);
  }
  ${TabularOptions} {
    table-layout: fixed;
    border-collapse: collapse;
    thead {
      background: var(--gray-050, #f3f7fc);
      border: 0;
      th {
        background: var(--gray-050, #f3f7fc);
        border: 0;
        border-bottom: 1px solid var(--border-hairline, rgba(51, 64, 77, .1));
        padding: 10px 9px;
        font-size: 12px;
        text-align: start;
      }
    }
  }
  .empty-state {
    padding: 14px 9px;
    color: var(--gray-500, #606d7b);
    background: var(--gray-050, #f3f7fc);
    border-bottom: 0;
  }
  ${Cell} {
    border-width: 0 0 1px;
    border-color: var(--border-hairline, rgba(51, 64, 77, .1));
    vertical-align: middle;
  }
  tbody tr:last-child ${Cell} { border-bottom: 0; }
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
    box-sizing: border-box;
    font: inherit;
    color: var(--gray-800, #33404d);
    &::placeholder { color: var(--gray-400, #7b8793); }
    &:hover:not(:disabled) { background: var(--gray-050, #f3f7fc); }
    &:focus {
      outline: none;
      box-shadow: inset 0 0 0 2px var(--blue-500, #0d99f2);
    }
  }
  && > .btn {
    align-self: start;
    width: auto;
  }
`;
