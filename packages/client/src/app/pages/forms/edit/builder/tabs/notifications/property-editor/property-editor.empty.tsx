import React from 'react';
import { EmptyBlock } from '@components/empty-block/empty-block';
import { spacings } from '@ff-client/styles/variables';
import translate from '@ff-client/utils/translations';
import styled from 'styled-components';

import EmptyIcon from './empty.icon.svg';
import { PropertyEditorWrapper } from './property-editor.styles';

export const Inline = styled.div`
  display: flex;
  gap: ${spacings.md};
`;

export const EmptyEditor: React.FC = () => {
  return (
    <PropertyEditorWrapper>
      <EmptyBlock
        title={translate('No notifications found')}
        subtitle={translate(
          'To add a notification, use the sidebar on the left'
        )}
        icon={<EmptyIcon />}
      />
    </PropertyEditorWrapper>
  );
};
