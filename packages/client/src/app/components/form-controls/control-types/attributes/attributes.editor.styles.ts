import { TabsWrapper } from "@editor/builder/tabs/tabs.styles";
import { scrollBar } from "@ff-client/styles/mixins";
import { borderRadius, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

import {
  PreviewEditor,
  PreviewEditorContainer,
} from "../../preview/previewable-component.styles";

export const AttributeEditorWrapper = styled(PreviewEditor)`
  gap: 0;
  padding: 0;
  overflow: hidden;
`;

export const AttributeTypeTabs = styled(TabsWrapper)`
  --freeform-builder-tab-gap: var(--c-spacing-lg);
  width: 100%;
  height: var(--c-size-control-lg);
  min-height: var(--c-size-control-lg);
  box-sizing: border-box;
  overflow: hidden;
  overflow-x: auto;
  align-self: flex-start;

  padding: 0 var(--c-spacing-lg);
  border-bottom: 1px solid var(--c-color-neutral-border-quiet);
  box-shadow: none;

  ${scrollBar};

  button {
    cursor: pointer;
    user-select: none;
  }
`;

export const AttributeTabContent = styled.div`
  padding: ${spacings.md};

  background: var(--c-surface-overlay);
`;

export const AttributeContainer = styled(PreviewEditorContainer)`
  border-radius: 0 0 ${borderRadius.lg} ${borderRadius.lg};
`;
