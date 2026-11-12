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
  }

  td.textual {
    vertical-align: middle;
  }

  td.textual input:focus-visible {
    box-shadow: var(--inner-focus-ring);
  }
`;

export const AddRow = styled(AddButtonArea)<{ $empty: boolean }>``;
