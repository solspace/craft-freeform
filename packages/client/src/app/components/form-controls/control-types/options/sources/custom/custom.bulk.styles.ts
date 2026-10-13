import styled from "styled-components";

export const BulkEditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 24px;
  textarea { min-height: 250px; height: 40vh; resize: vertical; }
`;
export const BulkSettings = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 24px;
  align-items: end;
`;
export const BulkSelect = styled.select`
  width: 100%;
  min-width: 0;
  padding: 7px 10px;
  border: 1px solid var(--gray-300, #a6b4c9);
  border-radius: var(--radius-lg, 5px);
  background: var(--white, #fff);
  color: inherit;
`;
