import React from 'react';
import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

import { PropertyEditorWrapper } from './property-editor.styles';

export const Inline = styled.div`
  display: flex;
  gap: ${spacings.md};
`;

export const EmptyEditor: React.FC = () => {
  return (
    <PropertyEditorWrapper>
      Please choose an option in the left panel
    </PropertyEditorWrapper>
  );
};
