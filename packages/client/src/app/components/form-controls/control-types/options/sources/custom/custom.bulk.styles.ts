import styled from "styled-components";

export const BulkEditorWrapper = styled.div`
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
