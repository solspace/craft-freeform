import { TabsWrapper } from '@editor/builder/tabs/index.styles';
import { colors, shadows, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

import {
  PreviewEditor,
  PreviewEditorContainer,
} from '../../preview/previewable-component.styles';

export const AttributeEditorWrapper = styled(PreviewEditor)`
  gap: 0;
  padding: 0;
`;

export const AttributeTypeTabs = styled(TabsWrapper)`
  width: 100%;
  overflow: hidden;
  align-self: flex-start;

  padding: ${spacings.md} ${spacings.md} 0;
  box-shadow: ${shadows.bottom};
`;

export const AttributeTabContent = styled.div`
  padding: ${spacings.md};

  background: ${colors.white}; ;
`;

export const AttributeContainer = styled(PreviewEditorContainer)``;
