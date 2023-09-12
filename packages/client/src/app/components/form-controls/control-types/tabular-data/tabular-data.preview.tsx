import React from 'react';
import translate from '@ff-client/utils/translations';

import {
  NoContent,
  PreviewData,
  PreviewRow,
  PreviewTable,
  PreviewWrapper,
} from './tabular-data.preview.styles';
import type { ColumnConfiguration, ColumnValue } from './tabular-data.types';

type Props = {
  configuration: ColumnConfiguration[];
  values: ColumnValue[];
};

export const TabularDataPreview: React.FC<Props> = ({
  configuration,
  values,
}) => {
  return (
    <PreviewWrapper data-edit={translate('Click to edit data')}>
      <PreviewTable>
        {!values.length && <NoContent>{translate('Not configured yet')}</NoContent>}
        {values.map((row, index) => (
          <PreviewRow key={index}>
            {configuration.map((column, columnIndex) => (
              <PreviewData
                key={columnIndex}
                data-empty={translate('empty')}
                data-title={column.label}
              >
                {row[columnIndex]}
              </PreviewData>
            ))}
          </PreviewRow>
        ))}
      </PreviewTable>
    </PreviewWrapper>
  );
};
