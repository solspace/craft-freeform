import React from 'react';
import translate from '@ff-client/utils/translations';

import { NoContent, PreviewWrapper } from '../table/table.preview.styles';

import { PreviewContainer } from './wysiwyg.preview.styles';

type Props = {
  value: string;
};

export const WysiwygPreview: React.FC<Props> = ({ value }) => {
  return (
    <PreviewWrapper data-edit={translate('Click to edit data')}>
      <PreviewContainer>
        {!value && <NoContent>{translate('No content')}</NoContent>}
        <div dangerouslySetInnerHTML={{ __html: value }} />
      </PreviewContainer>
    </PreviewWrapper>
  );
};
