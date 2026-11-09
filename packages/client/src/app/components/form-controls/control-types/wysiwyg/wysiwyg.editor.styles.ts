import styled from "styled-components";

export const WysiwygEditorWrapper = styled.div<{ $fullHeight?: boolean }>`
  height: ${({ $fullHeight }) => ($fullHeight ? "100%" : "auto")};
  min-height: 0;

`;
