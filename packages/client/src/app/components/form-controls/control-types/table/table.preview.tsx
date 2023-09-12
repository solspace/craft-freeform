import React from 'react';
import type { ColumnDescription } from '@components/form-controls/control-types/table/table.types';
import type { Option as PropertyOption } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import {
  NoContent,
  PreviewData,
  PreviewRow,
  PreviewTable,
  PreviewWrapper,
} from './table.preview.styles';

type Props = {
  columnTypes: PropertyOption[];
  columns: ColumnDescription[];
};

const getColumnTypeLabel = (types: PropertyOption[], value: string): string => {
  return types.find((type) => type.value === value)?.label || value;
};

export const TablePreview: React.FC<Props> = ({
  columnTypes: types,
  columns: options,
}) => {
  return (
    <PreviewWrapper data-edit={translate('Click to edit data')}>
      <PreviewTable>
        {!options.length && <NoContent>{translate('Not configured yet')}</NoContent>}
        {options.map((option, index) => (
          <PreviewRow
            key={index}
            data-title={getColumnTypeLabel(types, option.type)}
          >
            <PreviewData data-empty={translate('empty')}>
              {option.label}
            </PreviewData>
            <PreviewData data-empty={translate('empty')}>
              {option.value}
            </PreviewData>
          </PreviewRow>
        ))}
      </PreviewTable>
    </PreviewWrapper>
  );
};
