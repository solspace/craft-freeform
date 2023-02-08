import React from 'react';
import translate from '@ff-client/utils/translations';

import {
  NoContent,
  PreviewData,
  PreviewTable,
  PreviewWrapper,
} from '../../../table/table.preview.styles';
import type { CustomOptions } from '../../options.types';

import { PreviewRow } from './custom.preview.styles';

type Props = {
  value: CustomOptions;
};

export const CustomPreview: React.FC<Props> = ({ value }) => {
  const { options = [], useCustomValues } = value;

  return (
    <PreviewWrapper data-edit={translate('Click to edit data')}>
      <PreviewTable>
        {!options.length && <NoContent>{translate('No content')}</NoContent>}
        {options.map((option, index) => (
          <PreviewRow key={index}>
            <PreviewData data-empty={translate('empty')}>
              {option.label}
            </PreviewData>
            {useCustomValues && (
              <PreviewData data-empty={translate('empty')}>
                {option.value}
              </PreviewData>
            )}
          </PreviewRow>
        ))}
      </PreviewTable>
    </PreviewWrapper>
  );
};
