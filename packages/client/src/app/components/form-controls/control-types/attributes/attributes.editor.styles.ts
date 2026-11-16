import { TabsWrapper } from "@editor/builder/tabs/tabs.styles";
import { scrollBar } from "@ff-client/styles/mixins";
import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from "@ff-client/styles/variables";
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
  width: 100%;
  overflow: hidden;
  overflow-x: auto;
  align-self: flex-start;

  padding: ${spacings.md} ${spacings.md} 0;
  box-shadow: ${shadows.bottom};

  ${scrollBar};

  a {
    cursor: pointer;
    user-select: none;
  }
`;

export const AttributeTabContent = styled.div`
  padding: ${spacings.md};

  background: light-dark(${colors.white}, ${colors.surface});
`;

export const AttributeContainer = styled(PreviewEditorContainer)`
  border-radius: 0 0 ${borderRadius.lg} ${borderRadius.lg};
`;
