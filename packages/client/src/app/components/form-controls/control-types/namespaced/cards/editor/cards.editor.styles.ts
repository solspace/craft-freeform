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
  grid-template-columns: minmax(0, 1fr);
  gap: var(--m, 14px);
  margin: 0;
  padding: 0;
  list-style: none;

  @container (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @container (min-width: 1000px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;
