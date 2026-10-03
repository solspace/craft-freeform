import {
  PreviewEditor,
  PreviewEditorContainer,
} from "@form-controls/preview/previewable-component.styles";
import styled from "styled-components";

export const CardsEditorWrapper = styled(PreviewEditor)`
  width: 100%;
  min-width: 0;
`;
export const CardsContainer = styled(PreviewEditorContainer)`
  max-height: none;
  overflow: visible;
`;

export const CardList = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: var(--c-spacing-md, 16px);
  margin: 0;
  padding: 0;
  list-style: none;
`;
