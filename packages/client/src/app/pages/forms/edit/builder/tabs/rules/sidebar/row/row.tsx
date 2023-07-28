import React from 'react';
import { useSelector } from 'react-redux';
import type { Row as RowType } from '@editor/builder/types/layout';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';

import { Field } from '../field/field';

import { RowWrapper } from './row.styles';

type Props = {
  row: RowType;
};

export const Row: React.FC<Props> = ({ row }) => {
  const fields = useSelector(fieldSelectors.inRow(row));

  return (
    <RowWrapper>
      {fields.map((field) => (
        <Field key={field.uid} field={field} />
      ))}
    </RowWrapper>
  );
};
