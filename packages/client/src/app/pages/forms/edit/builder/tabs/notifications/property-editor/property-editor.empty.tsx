import React from 'react';
import { EmptyBlock } from '@components/empty-block/empty-block';
import translate from '@ff-client/utils/translations';

import EmptyIcon from './empty.icon.svg';
import { PropertyEditorWrapper } from './property-editor.styles';

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
