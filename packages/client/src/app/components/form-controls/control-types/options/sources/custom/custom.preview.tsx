import React from 'react';
import {
  NoContent,
  PreviewData,
  PreviewTable,
  PreviewWrapper,
} from '@components/form-controls/control-types/table/table.preview.styles';
import translate from '@ff-client/utils/translations';

import type { CustomOptionsConfiguration } from '../../options.types';

import { PreviewRow } from './custom.preview.styles';

type Props = {
  value: CustomOptionsConfiguration;
  defaultValue: string | string[];
  isMultiple: boolean;
};

export const CustomPreview: React.FC<Props> = ({ value }) => {
  const { options = [], useCustomValues } = value;

  return (
    <PreviewWrapper data-edit={translate('Click to edit data')}>
      <PreviewTable>
        {!options.length && (
          <NoContent>{translate('Not configured yet')}</NoContent>
        )}
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
