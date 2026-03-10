import {
  PreviewEditor,
  PreviewEditorContainer,
} from "@form-controls/preview/previewable-component.styles";
import styled from "styled-components";

export const CardsEditorWrapper = styled(PreviewEditor)`
  width: 60vw;
  min-width: 800px;
`;
export const CardsContainer = styled(PreviewEditorContainer)``;

export const CardList = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
`;
