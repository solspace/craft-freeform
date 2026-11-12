import { createGlobalStyle } from "styled-components";

export const EditorGlobalStyles = createGlobalStyle`
  #freeform-client-app {
    height: calc(100dvh - var(--cp-header-height) - var(--cp-container-padding));
    min-height: 360px;
  }
`;
