import { AddButtonArea } from "@components/elements/add-button-area/add-button-area";
import styled from "styled-components";

export const Editor = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  width: 100%;

  table {
    table-layout: fixed;
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  td.textual {
    vertical-align: middle;
  }

  td.textual input:focus-visible {
    box-shadow: var(--inner-focus-ring);
  }
`;

export const AddRow = styled(AddButtonArea)<{ $empty: boolean }>`
  box-sizing: border-box;
  border-color: var(--gray-250, #b4c3d3);
  border-top: ${({ $empty }) =>
    $empty ? "1px dashed var(--gray-250, #b4c3d3)" : "none"};
  border-radius: ${({ $empty }) =>
    $empty
      ? "var(--radius-lg, 5px)"
      : "0 0 var(--radius-lg, 5px) var(--radius-lg, 5px)"};

  && .btn {
    background: var(--white, #fff);
    border-radius: inherit;

    &:hover:not(:disabled) {
      background: var(--gray-050, #f3f7fc);
    }
  }
`;
