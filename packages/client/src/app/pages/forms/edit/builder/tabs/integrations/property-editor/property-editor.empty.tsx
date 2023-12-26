import React from 'react';
import { EmptyBlock } from '@components/empty-block/empty-block';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';

import EmptyIcon from './empty.icon.svg';
import { PropertyEditorWrapper } from './property-editor.styles';

export const EmptyEditor: React.FC = () => {
  return (
    <PropertyEditorWrapper>
      <EmptyBlock
        title={translate('No integrations found')}
        subtitle={translate('To add an integration, click the button below')}
        icon={<EmptyIcon />}
      >
        <a
          className={classes('btn add icon')}
          href={generateUrl('settings/integrations/crm')}
        >
          {translate('Add integration')}
        </a>
      </EmptyBlock>
    </PropertyEditorWrapper>
  );
};
