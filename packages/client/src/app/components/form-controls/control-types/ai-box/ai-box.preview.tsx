import React from 'react';
import translate from '@ff-client/utils/translations';
import { sanitize } from 'dompurify';

import { NoContent, PreviewWrapper } from '../table/table.preview.styles';

import { PreviewContainer } from './ai-box.preview.styles';
import { generateValue } from './field-selection.hooks';

type Props = {
  value: string;
};

export const AiBoxPreview: React.FC<Props> = ({ value }) => {
  return (
    <PreviewWrapper data-edit={translate('Click to edit data')}>
      <PreviewContainer>
        {!value && <NoContent>{translate('Not configured yet')}</NoContent>}
        <div
          style={{ lineHeight: '2.0' }}
          dangerouslySetInnerHTML={{
            __html: sanitize(generateValue(value, '<mark>...</mark>')),
          }}
        />
      </PreviewContainer>
    </PreviewWrapper>
  );
};
