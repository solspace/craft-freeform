import { ControlWrapper } from "@components/form-controls/control.styles";
import { scrollBar } from "@ff-client/styles/mixins";
import styled from "styled-components";

export const EditorContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100%;
`;

export const EditorWrapper = styled.div`
  position: relative;
  z-index: 2;

  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: 12px 16px 24px;
  padding-inline-start: var(--freeform-integration-padding-start);

  flex: 1;
  min-height: 0;

  background: var(--c-surface-default);

  ${ControlWrapper}:has(input.text, textarea.text, [role="combobox"]) {
    max-inline-size: min(100%, 40rem);
  }

  ${scrollBar};

  hr {
    margin: 0;
    margin-inline-start: calc(-1 * var(--freeform-integration-padding-start));
    margin-inline-end: -16px;
    width: auto;
    max-width: none;
    border: 0;
    border-block-start: 1px solid var(--c-color-border-quiet);
  }
`;

export const ActionsWrapper = styled.footer`
  flex-shrink: 0;

  #freeform-client-app & {
    padding-inline-start: var(--freeform-integration-padding-start);
  }
`;

export const EditorTabsWrapper = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 0;
  padding-inline: var(--freeform-integration-padding-start) 16px;
  border-block-end: 1px solid var(--c-color-border-quiet);

  a {
    padding-block: 8px;
    color: var(--c-text-default);
    border-block-end: 2px solid transparent;
    text-decoration: none;

    &.active {
      border-color: var(--c-color-accent-fill-loud);
      font-weight: 600;
    }
  }
`;
