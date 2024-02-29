import React from 'react';
import translate from '@ff-client/utils/translations';

import { NoContent, PreviewWrapper } from '../table/table.preview.styles';

import { generateValue } from './calculation-box.hooks';
import { PreviewContainer } from './calculation-box.preview.styles';

type Props = {
  value: string;
};

export const CalculationBoxPreview: React.FC<Props> = ({ value }) => {
  return (
    <PreviewWrapper data-edit={translate('Click to edit data')}>
      <PreviewContainer>
        {!value && <NoContent>{translate('Not configured yet')}</NoContent>}
        <div
          dangerouslySetInnerHTML={{
            __html: generateValue(value, '<mark>...</mark>'),
          }}
        />
      </PreviewContainer>
    </PreviewWrapper>
  );
};
