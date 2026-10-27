import styled from "styled-components";

export const ImportExportWrapper = styled.div`
  grid-area: content;
  min-width: 0;

  #content.content-pane {
    padding: 12px 16px 24px;
    background: var(--c-surface-default);

    input.text, textarea.text, input[type='file'] {
      max-inline-size: min(100%, 40rem);
    }

    > .field {
      margin-block: 24px;
    }
  }
`;
