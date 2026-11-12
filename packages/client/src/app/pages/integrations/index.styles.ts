import styled from "styled-components";

export const IntegrationsLayout = styled.div`
  --freeform-integration-padding-start: calc(var(--c-spacing-lg) + var(--c-spacing-sm));

  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas: 'sidebar header' 'sidebar content';
  min-height: calc(100dvh - var(--cp-header-height) - 16px);
  margin-inline: calc(-1 * var(--cp-container-padding));

  &::before {
    content: '';
    grid-area: sidebar;
    justify-self: end;
    align-self: stretch;
    border-inline-end: 1px solid var(--c-color-border-quiet);
    pointer-events: none;
    z-index: 3;
  }

  > #header-container {
    grid-area: header;
    padding-inline: 16px;
    padding-inline-start: var(--freeform-integration-padding-start);

    #header {
      padding: 16px 0 8px;
      align-items: center;
    }
  }

  @media (max-width: 1023px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto minmax(0, 1fr);
    grid-template-areas: 'sidebar' 'header' 'content';

    &::before {
      display: none;
    }
  }
`;

export const IntegrationsWrapper = styled.div`
  display: contents;
`;

export const IntegrationsEditorPanel = styled.div`
  grid-area: content;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--c-surface-default);
`;
