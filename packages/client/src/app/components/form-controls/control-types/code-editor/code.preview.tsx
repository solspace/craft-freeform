import React from 'react';
import translate from '@ff-client/utils/translations';

import { NoContent, PreviewWrapper } from '../table/table.preview.styles';

import { Pre, PreviewContainer } from './code.preview.styles';

type Props = {
  value: string;
};

export const CodePreview: React.FC<Props> = ({ value }) => {
  return (
    <PreviewWrapper data-edit={translate('Click to edit data')}>
      <PreviewContainer>
        {!value && <NoContent>{translate('No content')}</NoContent>}
        <Pre>{value}</Pre>
      </PreviewContainer>
    </PreviewWrapper>
  );
};
