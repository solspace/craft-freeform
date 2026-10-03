import { dropdownControl } from "@ff-client/styles/craft6";
import styled from "styled-components";

export const BulkEditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--c-spacing-lg, 24px);
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--c-spacing-lg, 24px);

  textarea {
    min-height: 250px;
    height: 40vh;
    resize: vertical;
  }

  & + footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--c-spacing-md, 16px);
    flex-wrap: wrap;
  }
`;

export const BulkSettings = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: var(--c-spacing-lg, 24px);
  align-items: end;
`;

export const BulkSelect = styled.select`
  ${dropdownControl}
  width: 100%;
  min-width: 0;
  padding: var(--c-input-spacing-block) var(--c-input-spacing-inline);
`;
