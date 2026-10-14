import styled from "styled-components";

export const WysiwygEditorWrapper = styled.div<{ $fullHeight?: boolean }>`
  height: ${({ $fullHeight }) => ($fullHeight ? "100%" : "auto")};
  min-height: 0;
  .tox {
    border: 1px solid #d1d1d1;
    border-radius: 0;
    padding: 0;
  }
`;
